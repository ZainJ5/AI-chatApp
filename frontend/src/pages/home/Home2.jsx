import Sidebar2 from "../../components/sidebar/Sidebar2";
import MessageContainer from "../../components/messages/MessageContainer";
import useConversation from "../../zustand/useConversation";
import { useState, useEffect } from "react";

const Home2 = () => {
  const { selectedConversation } = useConversation();
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-[100%] antialiased text-gray-800">
      <div className="flex flex-col lg:flex-row h-full w-full overflow-x-hidden">
        <div 
          className={`lg:w-[30%] w-full lg:static fixed inset-0 z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            selectedConversation && isMobileView ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <Sidebar2 />
        </div>
        
        <div 
          className={`lg:w-[70%] w-full transform transition-transform duration-300 ease-in-out ${
            !selectedConversation && isMobileView ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <MessageContainer />
        </div>
      </div>
    </div>
  );
};

export default Home2;