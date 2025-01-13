import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import { useEffect, useState } from "react";

const Conversation = ({ conversation, lastIdx, emoji, onItemClick }) => {
	const { selectedConversation, setSelectedConversation } = useConversation();
	const { onlineUsers } = useSocketContext();
	const [validatedPic, setValidatedPic] = useState(conversation.profilePic);
	const isOnline = onlineUsers.includes(conversation._id);
	const isSelected = selectedConversation?._id === conversation._id;

	useEffect(() => {
		if (conversation.profilePic) {
			const img = new Image();
			img.onload = () => {
				setValidatedPic(conversation.profilePic);
			};
			img.onerror = () => {
				const cacheBustedUrl = `${conversation.profilePic}?t=${new Date().getTime()}`;
				const retryImg = new Image();
				retryImg.onload = () => setValidatedPic(cacheBustedUrl);
				retryImg.onerror = () => setValidatedPic(conversation.profilePic);
				retryImg.src = cacheBustedUrl;
			};
			img.src = conversation.profilePic;
		}
	}, [conversation.profilePic]);

	const handleClick = () => {
		onItemClick(conversation._id);
		setSelectedConversation(conversation);
	};

	return (
		<>
			<div
				className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1
				cursor-pointer
				${isSelected ? "bg-sky-500" : ""}
				`}
				onClick={handleClick}
			>
				<div className={`avatar ${isOnline ? "online" : ""}`}>
					<div className='w-12 rounded-full'>
						<img 
							src={validatedPic} 
							alt='user avatar' 
							referrerPolicy="no-referrer"
						/>
					</div>
				</div>

				<div className='flex flex-col flex-1'>
					<div className='flex gap-3 justify-between'>
						<p className='font-bold capitalize'>{conversation.fullName}</p>
						<span className='text-xl'>{emoji}</span>
					</div>
				</div>
			</div>

			{!lastIdx && <div className='divider my-0 py-0 h-1' />}
		</>
	);
};
export default Conversation;