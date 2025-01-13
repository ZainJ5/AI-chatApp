import React, { useState, useEffect } from "react";
import { BsSend, BsFileEarmarkArrowUp } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation";
import axios from "axios";

const MessageInput = () => {
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { loading, sendMessage } = useSendMessage();
    const { selectedConversation } = useConversation();
    const { authUser } = useAuthContext();

    const senderId = authUser._id;
    const receiverId = selectedConversation?._id;
    
    const allowedFileTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.ms-excel"
    ];

    const isChatGPT = selectedConversation?.username === "chatgpt";
    const [isGPTMessage, setIsGPTMessage] = useState(false);

    useEffect(() => {
        setIsGPTMessage(message.trim().toLowerCase().startsWith("@gpt") || isChatGPT);
    }, [message, isChatGPT]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && allowedFileTypes.includes(file.type)) {
            setSelectedFile(file);
        } else {
            alert("Please select a PDF, Excel, or Word file.");
            e.target.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message && !selectedFile) return;
        if (!selectedConversation) return;

        if (selectedFile && isGPTMessage) {
            await uploadFile(selectedFile);
        } else {
            if (isGPTMessage) {
                const aiMessage = isChatGPT ? message : message.slice(4).trim();
                await sendMessage(aiMessage, true);
            } else {
                await sendMessage(message, false);
            }
        }

        setMessage("");
        setSelectedFile(null);
    };

    const uploadFile = async (file) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("message", isChatGPT ? message : message.slice(4).trim());
        formData.append("senderId", senderId);
        formData.append("receiverId", receiverId);
    
        try {
            const response = await axios.post(`/api/messages/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log("File uploaded successfully:", response.data.newMessage);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    if (!selectedConversation) return null;

    return (
        <div className="px-4 my-3">
            {isGPTMessage && (
                <div className="mb-2 text-sm text-blue-500 bg-blue-100 p-2 rounded">
                    {isChatGPT ? "You are chatting with AI." : "This message will be sent to GPT for an AI response."}
                    You can upload PDF, Excel, or Word files.
                    {selectedFile && (
                        <div className="mt-1">
                            Selected file: {selectedFile.name}
                        </div>
                    )}
                </div>
            )}
           <form onSubmit={handleSubmit}>
    <div className='w-full relative flex items-center'>
        <label
            htmlFor="fileInput"
            className={`absolute cursor-pointer left-0 pl-3 flex items-center h-full ${!isGPTMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isGPTMessage ? "Upload PDF, Excel, or Word file" : "File upload is only available for AI responses"}
        >
            <BsFileEarmarkArrowUp />
        </label>
        <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={!isGPTMessage}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
        />
        <input
            type='text'
            className='border text-sm rounded-lg pl-10 pr-10 block w-full p-2.5 border-gray-600'
            placeholder={isChatGPT ? 'Send a message to AI' : 'Send a message (use @gpt for AI responses)'}
            value={message}
            onChange={handleMessageChange}
        />
        <button type='submit' className='absolute right-0 pr-3 flex items-center h-full'>
            {loading || isUploading ? <div className='loading loading-spinner'></div> : <BsSend />}
        </button>
    </div>
</form>

        </div>
    );
};

export default MessageInput;