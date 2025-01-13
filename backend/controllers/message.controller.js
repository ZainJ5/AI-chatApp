import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io,userSocketMap} from "../socket/socket.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import mammoth from "mammoth";
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();import ExcelJS from "exceljs";
import getAIResponse from './AIResponse.controller.js';

export const uploadFile = async (req, res) => {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    try {
        const { senderId, receiverId, message } = req.body;
        
        console.log("Sender ID:", senderId);
        console.log("Receiver ID:", receiverId);
        console.log("Message:", message);

        if (!senderId || !receiverId) {
            throw new Error("Both senderId and receiverId are required");
        }

        if (!req.file) {
            throw new Error("No file uploaded");
        }

        const fileBuffer = await fs.readFile(req.file.path);

        let extractedText = '';

        switch (req.file.mimetype) {
            case "application/pdf":
                const pdfData = await pdfExtract.extractBuffer(fileBuffer);
                extractedText = pdfData.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
                break;
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            case "application/vnd.ms-excel":
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(fileBuffer);
                extractedText = workbook.worksheets.reduce((text, sheet) => {
                    sheet.eachRow((row) => {
                        text += row.values.join(' ') + '\n';
                    });
                    return text;
                }, '');
                break;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            case "application/msword":
                const result = await mammoth.extractRawText({ buffer: fileBuffer });
                extractedText = result.value;
                break;
            default:
                throw new Error("Unsupported file type");
        }
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        let history = '';
        if (conversation) {
           history = await getLastMessages(conversation._id,3)
        }
        
        const prompt = `Context: Previous conversation history:
${history}

User message: "${message}"

File content (first 500 characters): 
${extractedText.slice(0, 500)}${extractedText.length > 500 ? '...' : ''}

Task: Analyze the file content in relation to the context and user message. Provide a focused, relevant response to address the user's needs.`;

        const aiResponse = await getAIResponse(prompt);

        const fileObj = {
            path: req.file.path,
            name: req.file.originalname,
            senderId: senderId,
            receiverId: receiverId,
            message: message || '',
            mimeType: req.file.mimetype,
            extractedText: extractedText,
            aiResponse: aiResponse
        };

        console.log("File Information:", {
            ...fileObj,
            extractedText: `${extractedText.length} characters extracted`,
            aiResponse: `${aiResponse.length} characters in AI response`
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }
		const userpromptmessage= message+" File sent: "+req.file.originalname
		const userprompt= new Message({
			senderId,
			receiverId,
			message:userpromptmessage,
			isAIMessage: false,

		})
        let aiMessage;
        aiMessage = new Message({
            senderId: new mongoose.Types.ObjectId(), 
            receiverId,
            message: aiResponse,
            isAIMessage: true
        });
        conversation.messages.push(aiMessage._id);
        conversation.messages.push(userprompt._id);
        await Promise.all([conversation.save(),userprompt.save(),aiMessage.save()]);
        const senderSocketId = getReceiverSocketId(senderId);
        console.log("Sender's socket ID:", senderSocketId);
        const receiverSocketId = getReceiverSocketId(receiverId);
        console.log("Receiver's socket ID:", receiverSocketId);

		io.to(senderSocketId).emit("newMessage", userprompt);
		io.to(receiverSocketId).emit("newMessage", userprompt);

        if (aiMessage) {
            if (senderSocketId) {
                io.to(senderSocketId).emit("newMessage", aiMessage);
            }
            if (receiverSocketId) {
				io.to(receiverSocketId).emit("newMessage", aiMessage);
            }
        }

		res.status(200).json({ 
            message: "File uploaded and processed successfully",
            userMessage: userprompt,
            aiMessage: aiMessage
        });

    } catch (error) {
        console.error("Error in file upload and processing:", error.message);
        res.status(500).json({ 
            error: "File upload and processing failed", 
            details: error.message 
        });
    }
};





export const sendMessage = async (req, res) => {
    try {
        const { message, isAIResponse } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        console.log("Message from server", isAIResponse);

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
		

        conversation.messages.push(newMessage._id);

        let aiMessage;
        if (isAIResponse) {
            let history = '';
            if (conversation) {
               history = await getLastMessages(conversation._id,5)
            }
            
            const prompt = `Context: Previous conversation history:
            ${history}
            
            User message: "${message}"
            
            Task: Analyze the user's query in relation to the context. Provide a focused, relevant response to address the user's needs based on the conversation history.`;            
    
            const aiResponse = await getAIResponse(prompt);
            aiMessage = new Message({
                senderId: new mongoose.Types.ObjectId(), 
                receiverId,
                message: aiResponse,
                isAIMessage: true
            });
            conversation.messages.push(aiMessage._id);
        }

        let response;
        if (aiMessage) {
            await Promise.all([conversation.save(), newMessage.save(), aiMessage.save()]);
            response = [newMessage, aiMessage];
        } else {
            await Promise.all([conversation.save(), newMessage.save()]);
            response = newMessage;
        }

		const senderSocketId = getReceiverSocketId(senderId);
        console.log("Sender's socket ID:", senderSocketId);
        const receiverSocketId = getReceiverSocketId(receiverId);
        console.log("Receiver's socket ID:", receiverSocketId);
        
        if (senderSocketId) {
            console.log("Emitting original message to sender");
            io.to(senderSocketId).emit("newMessage", newMessage);
        } else {
            console.log("Sender socket ID not found");
        }
        if (receiverSocketId) {
            console.log("Emitting original message to receiver");
            io.to(receiverSocketId).emit("newMessage", newMessage);
        } else {
            console.log("Receiver socket ID not found");
        }
        
        if (aiMessage) {
            if (senderSocketId) {
                io.to(senderSocketId).emit("newMessage", aiMessage);
            }
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", aiMessage);
            }
        }

        res.status(201).json(response);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const senderId = req.user._id;
        const userToChatId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");

        if (!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};








                                                //Optional for AI historry response

const getLastMessages = async (conversationId, length) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: 'messages',
        options: { sort: { 'createdAt': -1 }, limit: length },
      })
      .exec();


    if (!conversation) {
      console.error('Conversation not found for ID:', conversationId);
      throw new Error('Conversation not found');
    }


    let concatenatedMessages = conversation.messages
      .map(msg => {
        let slicedMessage = msg.message.split(/\s+/).slice(0, 25).join(' ');
        if (msg.message.split(/\s+/).length > 10) {
          slicedMessage += '...';
        }
        return slicedMessage;
      })
      .reverse()
      .join(' ');

    return concatenatedMessages;
  } catch (error) {
    console.error('Error in getLastMessages:', error);
    throw error;
  }
};