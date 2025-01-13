import React, { useState, useEffect } from "react";
import { MessageCircle, Settings, LogOut } from "lucide-react";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import { useAuthContext } from "../../context/AuthContext";
import MessageContainer from "../../components/messages/MessageContainer";

const Sidebar = () => {
  const { authUser } = useAuthContext();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [validImageUrl, setValidImageUrl] = useState(null);

  const validateImageUrl = async (url) => {
    if (!url) return false;
    
    try {
      const img = new Image();
      
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => {
          resolve(true);
        };
        
        img.onerror = () => {
          const cacheBustedUrl = `${url}?t=${new Date().getTime()}`;
          const retryImg = new Image();
          
          retryImg.onload = () => resolve(cacheBustedUrl);
          retryImg.onerror = () => reject(new Error('Image failed to load'));
          
          retryImg.src = cacheBustedUrl;
        };
      });

      img.src = url;
      const result = await imageLoadPromise;
      return result;
    } catch (error) {
      console.error("Error validating image URL:", error);
      return false;
    }
  };

  useEffect(() => {
    const validateAndSetImage = async () => {
      if (!authUser?.profilePic) {
        setValidImageUrl(null);
        setImageLoaded(false);
        setImageError(false);
        return;
      }

      try {
        setImageLoaded(false);
        setImageError(false);
        
        const validUrl = await validateImageUrl(authUser.profilePic);
        if (validUrl) {
          setValidImageUrl(typeof validUrl === 'string' ? validUrl : authUser.profilePic);
          setImageLoaded(true);
        } else {
          setValidImageUrl(null);
          setImageError(true);
        }
      } catch (error) {
        console.error("Error in image validation:", error);
        setValidImageUrl(null);
        setImageError(true);
      }
    };

    validateAndSetImage();
  }, [authUser?.profilePic]);

  const handleConversationClick = (conversationId) => {
    setSelectedConversation(conversationId);
    console.log("Selected Conversation:", conversationId);
  };

  const getUserDisplayInfo = () => {
    if (!authUser) {
      console.warn("No auth user found in context");
      return {
        initial: "?",
        displayName: "Not logged in",
        username: "No username available"
      };
    }  
    
    const initial = authUser.fullName?.[0]?.toUpperCase() || 
                   authUser.username?.[0]?.toUpperCase() || 
                   "?";
    
    return {
      initial,
      displayName: authUser.fullName || authUser.username,
      username: authUser.username
    };
  };

  const userInfo = getUserDisplayInfo();

  const ProfileImage = () => {
    if (!validImageUrl || imageError) {
      return (
        <div className="text-base font-medium text-gray-600 bg-gray-200 w-full h-full flex items-center justify-center">
          {userInfo.initial}
        </div>
      );
    }

    return (
      <>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
        )}
        
        <img
          src={validImageUrl}
          alt={`${userInfo.displayName}'s profile`}
          className={`w-full h-full rounded-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={(e) => {
            console.error("Profile image failed to load:", e);
            setImageError(true);
            setImageLoaded(false);
            setValidImageUrl(null);
          }}
          referrerPolicy="no-referrer"
        />
      </>
    );
  };

  return (
    <div className="w-[100%] h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center rounded-xl bg-indigo-50 h-12 w-12 transition-all duration-200 hover:bg-indigo-100">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
              <p className="text-sm text-gray-500">
                {userInfo.username || "Your conversations"}
              </p>
            </div>
          </div>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => console.log("Current auth state:", { authUser })}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto scrollbar-thin"
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
        <div className="px-6 pt-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Recent Conversations
          </h2>
          <Conversations onItemClick={handleConversationClick} />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
              <ProfileImage />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                {authUser?.fullName || "User"}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                {authUser ? `@${authUser.username}` : 'Offline'}
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;