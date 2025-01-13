import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
	try {
		const { message, isAIResponse } = req.body;
		console.log("Message from server",isAIResponse);
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
			isAIMessage: false
		});

		async function getAIResponse(prompt) {
			console.log("Message to GPT is:", prompt);
			try {
				const response = await fetch('https://api.openai.com/v1/chat/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer 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`,
					},
					body: JSON.stringify({
						model: 'gpt-4o-mini',
						messages: [{ role: 'user', content: prompt }],
					}),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const data = await response.json();
				console.log("ChatGPT response:", data);

				return data.choices[0].message.content;
			} catch (err) {
				console.error("Error while calling ChatGPT API", err.message);
				return "Sorry, there was an error processing your ChatGPT request.";
			}
		}

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		let aiMessage;
		if (isAIResponse) {
			const aiResponse = await getAIResponse(message);
			aiMessage = new Message({
				senderId: 'AI_SYSTEM',
				receiverId,
				message: aiResponse,
				isAIMessage: true
			});
			conversation.messages.push(aiMessage._id);
		}

		// SOCKET IO FUNCTIONALITY WILL GO HERE

		// Save all messages and the conversation
		if (aiMessage) {
			await Promise.all([conversation.save(), newMessage.save(), aiMessage.save()]);
			res.status(201).json([newMessage, aiMessage]);
		} else {
			await Promise.all([conversation.save(), newMessage.save()]);
			res.status(201).json(newMessage);
		}
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};