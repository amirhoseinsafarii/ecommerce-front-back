import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

import { useDispatch, useSelector } from "react-redux";
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (user) {
      const socket = io("http://localhost:5000", {
        query: {
          userId: user._id,
        },
      });

      setSocket(socket);

      // Socket event listeners
      socket.on("connect", () => {
        console.log("Connected to socket server");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });

      return () => {
        socket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
