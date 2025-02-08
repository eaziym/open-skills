// src/contexts/SocketContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket, connectSocket } from "../components/Chat/socket";
import { useUser } from "../components/utils/UserProvider";
const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [socketInstance, setSocketInstance] = useState(socket);
  const { userData } = useUser();
  const user_id = userData ? userData._id : null;

  useEffect(() => {
    if (user_id) {
      const newSocket = connectSocket(user_id);
      setSocketInstance(newSocket);

      return () => {
        if (newSocket?.connected) {
          newSocket.disconnect();
        }
      };
    }
  }, [user_id, dispatch]);

  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  );
};
