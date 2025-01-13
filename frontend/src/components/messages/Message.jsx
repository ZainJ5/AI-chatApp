import React, { useState, useEffect } from 'react';
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const Message = ({ message }) => {
    const { authUser } = useAuthContext();
    const { selectedConversation } = useConversation();
    const [validatedAuthPic, setValidatedAuthPic] = useState(authUser?.profilePic);
    const [validatedConversationPic, setValidatedConversationPic] = useState(selectedConversation?.profilePic);

    // Image validation function
    const validateImageUrl = async (url, setValidatedUrl) => {
        if (!url) return;

        const img = new Image();
        img.onload = () => {
            setValidatedUrl(url);
        };
        img.onerror = () => {
            const cacheBustedUrl = `${url}?t=${new Date().getTime()}`;
            const retryImg = new Image();
            retryImg.onload = () => setValidatedUrl(cacheBustedUrl);
            retryImg.onerror = () => setValidatedUrl(url);
            retryImg.src = cacheBustedUrl;
        };
        img.src = url;
    };

    // Validate auth user's profile picture
    useEffect(() => {
        validateImageUrl(authUser?.profilePic, setValidatedAuthPic);
    }, [authUser?.profilePic]);

    // Validate conversation user's profile picture
    useEffect(() => {
        validateImageUrl(selectedConversation?.profilePic, setValidatedConversationPic);
    }, [selectedConversation?.profilePic]);

    // Handle both single message object and array of messages
    const messages = Array.isArray(message) ? message : [message];

    return (
        <>
            {messages.map((msg, index) => {
                const fromMe = msg.senderId === authUser._id;
                const formattedTime = extractTime(msg.createdAt);

                let chatClassName;
                let profilePic;

                if (msg.isAIMessage) {
                    chatClassName = "chat-start";
                    profilePic = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyIS_GMENyqoWukYofDbpdwLZQoI5s0DmQiw&s";
                } else {
                    chatClassName = fromMe ? "chat-end" : "chat-start";
                    profilePic = fromMe ? validatedAuthPic : validatedConversationPic;
                }

                const bubbleBgColor = fromMe ? "bg-blue-500" : "";
                const shakeClass = msg.shouldShake ? "shake" : "";

                return (
                    <div key={msg._id || index} className={`chat ${chatClassName}`}>
                        <div className='chat-image avatar'>
                            <div className='w-10 rounded-full'>
                                {msg.isAIMessage ? (
                                        <img 
                                            alt='AI profile' 
                                            src={profilePic} 
                                            referrerPolicy="no-referrer"
                                        />
                                ) : (
                                    <img 
                                        alt='User profile' 
                                        src={profilePic} 
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                            </div>
                        </div>
                        <div className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2`}>
                            {msg.message}
                        </div>
                        <div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>
                            {formattedTime}
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default Message;