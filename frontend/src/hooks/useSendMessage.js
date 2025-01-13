import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();
	const receiverId = selectedConversation._id;

	const sendMessage = async (message, isAIResponse) => { 
		setLoading(true);
		console.log("Message from hook",isAIResponse)
		try {
			const res = await fetch(`/api/messages/send/${selectedConversation._id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message, receiverId, isAIResponse }), 
			});
			const data = await res.json();
			console.log(data);
			if (data.error) throw new Error(data.error);

			setMessages([...messages, data]);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading, receiverId };
};
export default useSendMessage;
