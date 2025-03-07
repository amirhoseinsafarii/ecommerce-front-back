import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { Dice1, Users } from "lucide-react";
// import { getUsers } from "@/store/message/chat-slice";
// import { setSelectedUser } from "@/store/message/chat-slice";
// import { getMessages } from "@/store/message/chat-slice";

import { formatMessageTime } from "@/lib/utils";
import MessageInput from "./message-input";
import { useSocket } from "@/context/SocketContext";
import { getMessages, handleSocketMessage } from "@/store/message/chat-slice";

function ChatContainer() {
  const { messages, selectedUser } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);

  // Fetch messages on component mount and when selectedUser changes
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("selectedUser"));
    if (storedUser?._id) {
      dispatch(getMessages(storedUser._id));
    }
  }, [selectedUser?._id, dispatch, messages]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !selectedUser?._id) return;

    const handleNewMessage = (message) => {
      dispatch(handleSocketMessage(message));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser?._id, dispatch]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (
      messageEndRef.current &&
      Array.isArray(messages) &&
      messages.length > 0
    ) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedUser && !sessionStorage.getItem("selectedUser")) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Select a user to start chatting
      </div>
    );
  }

  // if () {
  //   return (
  //     <div className="flex-1 flex flex-col overflow-auto">
  //       <div>Loading messages...</div>
  //       <MessageInput />
  //     </div>
  //   );
  // }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message?._id}
              className={`flex ${
                message?.senderId === user._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] ${
                  message?.senderId === user._id ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message?.senderId === user._id
                      ? "bg-primary text-primary-foreground rounded-bl-2xl rounded-br-none rounded-tl-2xl"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none rounded-br-2xl rounded-tr-2xl"
                  }`}
                >
                  {message?.text && (
                    <p className="text-sm leading-relaxed break-words">
                      {message?.text}
                    </p>
                  )}
                </div>
                <div
                  className={`flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                    message?.senderId === user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <span>{formatMessageTime(message?.createdAt)}</span>
                  {message?.senderId === user._id && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-gray-500 dark:text-gray-400">
                No messages yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <div className="border-t dark:border-gray-800">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;
