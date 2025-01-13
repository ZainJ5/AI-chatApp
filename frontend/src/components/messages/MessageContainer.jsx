import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation } = useConversation();
	const [isMobileView, setIsMobileView] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobileView(window.innerWidth < 1024);
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		const handleBeforeUnload = () => {
			setSelectedConversation(null);
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [setSelectedConversation]);

	const handleBack = () => {
		setSelectedConversation(null);
	};

	return (
		<div className='w-full lg:min-w-[900px] flex-1 flex flex-col h-screen lg:h-[calc(100vh-2rem)] overflow-hidden bg-gray-50'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					<div className='bg-white shadow-sm px-4 lg:px-6 py-4 border-b border-gray-200 flex-shrink-0'>
						<div className="flex items-center gap-2 lg:gap-3">
							{isMobileView && (
								<button
									onClick={handleBack}
									className="p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<ArrowLeft className="w-5 h-5 text-gray-600" />
								</button>
							)}
							<div className="h-8 lg:h-10 w-8 lg:w-10 rounded-full bg-indigo-100 flex items-center justify-center">
								<span className="text-indigo-600 font-semibold">
									{selectedConversation.fullName[0].toUpperCase()}
								</span>
							</div>
							<div>
								<span className='text-gray-600 text-sm'>To: </span>
								<span className='text-gray-900 font-semibold capitalize'>
									{selectedConversation.fullName}
								</span>
							</div>
						</div>
					</div>

					<div className="flex-1 overflow-hidden relative">
						<div 
							className="absolute inset-0 overflow-y-auto px-3 lg:px-4 py-2 scrollbar-thin"
							style={{
								'--scrollbar-width': '4px',
								'--scrollbar-track-bg': 'transparent',
								'--scrollbar-thumb-bg': 'rgb(203 213 225)',
								'--scrollbar-thumb-hover-bg': 'rgb(148 163 184)',
								scrollbarWidth: 'thin',
								scrollbarColor: 'var(--scrollbar-thumb-bg) var(--scrollbar-track-bg)',
							}}
						>
							<style jsx>{`
								.scrollbar-thin::-webkit-scrollbar {
									width: var(--scrollbar-width);
								}

								.scrollbar-thin::-webkit-scrollbar-track {
									background: var(--scrollbar-track-bg);
								}

								.scrollbar-thin::-webkit-scrollbar-thumb {
									background-color: var(--scrollbar-thumb-bg);
									border-radius: 20px;
									transition: background-color 0.2s ease;
								}

								.scrollbar-thin::-webkit-scrollbar-thumb:hover {
									background-color: var(--scrollbar-thumb-hover-bg);
								}
							`}</style>
							<Messages />
						</div>
					</div>

					<div className="border-t border-gray-200 bg-white p-3 lg:p-4 flex-shrink-0">
						<MessageInput />
					</div>
				</>
			)}
		</div>
	);
};

const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	return (
		<div className='flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'>
			<div className='px-4 lg:px-8 py-8 lg:py-12 bg-white rounded-2xl shadow-lg max-w-md w-full mx-4'>
				<div className='flex flex-col items-center gap-4 lg:gap-6 text-center'>
					<div className="w-12 lg:w-16 h-12 lg:h-16 bg-indigo-100 rounded-full flex items-center justify-center">
						<TiMessages className='text-3xl lg:text-4xl text-indigo-600' />
					</div>
					<div className="space-y-2">
						<p className='text-xl lg:text-2xl font-semibold text-gray-800'>
							Welcome 👋 {authUser.fullName} ❄
						</p>
						<p className='text-gray-600 text-sm lg:text-base'>
							Select a chat to start messaging
						</p>
					</div>
					<div className="w-full h-px bg-gray-100" />
					<p className="text-xs lg:text-sm text-gray-500">
						Your messages will appear here
					</p>
				</div>
			</div>
		</div>
	);
};

export default MessageContainer;