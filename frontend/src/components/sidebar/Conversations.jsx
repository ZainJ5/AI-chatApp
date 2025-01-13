import React, { useMemo } from "react";
import useGetConversations from "../../hooks/useGetConversations";
import { getRandomEmoji } from "../../utils/emojis";
import Conversation from "./Conversation";

const Conversations = ({ onItemClick }) => {
  const handleItemClick = (conversationId) => {
    onItemClick(conversationId);
  };

  const { loading, conversations } = useGetConversations();

  const sortedConversations = useMemo(() => {
    if (!conversations) return [];

    const aiConversation = conversations.find(conv => conv.username === "chatgpt");
    const otherConversations = conversations.filter(conv => conv.username !== "chatgpt");

    return aiConversation 
      ? [aiConversation, ...otherConversations] 
      : otherConversations;
  }, [conversations]);

  return (
    <div className='py-2 flex flex-col overflow-auto'>
      {sortedConversations.map((conversation, idx) => (
        <Conversation
          key={conversation._id}
          conversation={conversation}
          emoji={conversation.username === "chatgpt" ? "🤖" : getRandomEmoji()}
          lastIdx={idx === sortedConversations.length - 1}
          onItemClick={handleItemClick}
          isPinned={conversation.username === "chatgpt"}
        />
      ))}

      {loading ? <span className='loading loading-spinner mx-auto'></span> : null}
    </div>
  );
};

export default Conversations;