import Sidebar from "../../components/sidebar/Sidebar";
import MessageContainer from "../../components/messages/MessageContainer";

const Home = () => {
  return (
<div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
      <Sidebar />
    </div>
    </div>
  );
};

export default Home;
