import SideBar from "@/components/message-view/sidebar";
import NoChatSelected from "@/components/message-view/no-chat-selected";
import ChatContainer from "@/components/message-view/chat-container";
import { useDispatch, useSelector } from "react-redux";
function MessagesPage() {
  const { selectedUser } = useSelector((state) => state.chat);
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <SideBar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
}
export default MessagesPage;
