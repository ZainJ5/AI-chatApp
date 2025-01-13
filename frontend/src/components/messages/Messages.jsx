import React, { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import useListenMessages from "../../hooks/useListenMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";

const Messages = () => {
  const { messages, loading: messagesLoading } = useGetMessages();
  useListenMessages();
  const lastMessageRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      let messageDate;
      try {
        messageDate = new Date(message.createdAt);
        if (!isValidDate(messageDate)) {
          messageDate = new Date();
        }
      } catch (error) {
        messageDate = new Date(); 
      }

      const dateString = messageDate.toDateString();
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(message);
    });
    return groups;
  };

  const getDateLabel = (dateString) => {
    try {
      const date = new Date(dateString);
      if (!isValidDate(date)) {
        return "Today";
      }

      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);

      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === yesterday.toDateString();

      if (isToday) {
        return "Today";
      } else if (isYesterday) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Today"; 
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className='px-4 flex-1 overflow-auto'>
      {!messagesLoading && messages.length > 0 && (
        Object.entries(groupedMessages).map(([date, dateMessages], index) => (
          <React.Fragment key={date}>
            <div className="flex justify-center my-4">
              <span className="bg-gray-200 text-gray-600 rounded-full px-4 py-2 text-sm font-bold shadow-md">
                {getDateLabel(date)}
              </span>
            </div>
            {dateMessages.map((message, messageIndex) => (
              <div
                key={message._id}
                ref={index === Object.keys(groupedMessages).length - 1 && messageIndex === dateMessages.length - 1 ? lastMessageRef : null}
              >
                <Message message={message} />
              </div>
            ))}
          </React.Fragment>
        ))
      )}
      {messagesLoading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
      {!messagesLoading && messages.length === 0 && (
        <p className='text-center'>Send a message to start the conversation</p>
      )}
    </div>
  );
};

export default Messages;