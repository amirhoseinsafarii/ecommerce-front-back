import { useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "@/store/message/chat-slice";

const MessageInput = () => {
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedUser } = useSelector((state) => state.chat);
  console.log(selectedUser, "selected user in input message componentssss,,,,");
  function handleSendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;
    console.log("in handle send message");
    console.log(
      selectedUser,
      "selected user in input message componentssss,,,,1111"
    );

    console.log(
      selectedUser,
      "selected user in input message componentssss,,,,222"
    );
    dispatch(
      sendMessage({
        text: text.trim(),
      })
    ).then((data) => console.log(data));

    // Clear form
    setText("");
  }

  return (
    <div className="p-4 w-full">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          className="w-full input input-bordered rounded-lg input-sm sm:input-md"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim()}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
