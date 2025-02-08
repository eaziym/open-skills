import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useUser } from "../utils/UserProvider";
import { useDispatch, useSelector } from "react-redux";
import { 
  AddDirectMessage, 
  SetCurrentConversation,
  FetchCurrentMessages,
} from "../../redux/slices/conversation";
import { SelectConversation } from "../../redux/slices/app";
import { v4 as uuidv4 } from 'uuid';

// ChatHeader: Display the other user's info.
const ChatHeader = () => {
  const { state } = useLocation();
  const matchedUser = state?.matchedUser || {};

  const currentConversation = useSelector(
    (state) => state.conversation.direct_chat.current_conversation
  );
  // Get current user id from localStorage (or default to "user1")
  const currentUser = localStorage.getItem("user_id") || "user1";
  // Use _id for comparing as the backend returns _id.
  const otherUser =
    currentConversation?.participants?.find(
      (p) => p._id.toString() !== currentUser
    ) || { name: "Unknown User", profilePic: "https://i.pravatar.cc/40" };
  console.log("otherUser", otherUser);
  // Fetch profile of other user
  console.log("matchedUser", matchedUser);
  return (
    <header className="flex items-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 border-b border-blue-200 dark:border-blue-700">
      <img
        src={matchedUser.profilePic || "https://i.pravatar.cc/40"}
        alt={matchedUser.fname + " " + matchedUser.lname}
        className="w-10 h-10 rounded-full mr-4 border-2 border-blue-400 dark:border-blue-500"
      />
      <div>
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          {matchedUser.fname + " " + matchedUser.lname}
        </h2>
      </div>
    </header>
  );
};

// Conversation: Displays the list of messages.
const Conversation = () => {
  const messages = useSelector(
    (state) => state.conversation.direct_chat.current_messages
  );
  const bottomRef = useRef(null);

  // Scroll to the newest message whenever messages update.
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-blue-50 dark:bg-slate-800">
      {messages &&
        messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 ${
              msg.from === (localStorage.getItem("user_id") || "user1")
                ? "text-right"
                : "text-left"
            }`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm ${
                msg.from === (localStorage.getItem("user_id") || "user1")
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white"
                  : "bg-blue-100 dark:bg-blue-900 text-gray-800 dark:text-gray-100"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      <div ref={bottomRef} />
    </div>
  );
};

// ChatFooter: Contains the input box and send button.
const ChatFooter = () => {
  const dispatch = useDispatch();
  const [messageText, setMessageText] = useState("");
  const currentConversation = useSelector(
    (state) => state.conversation.direct_chat.current_conversation
  );
  const currentUser = localStorage.getItem("user_id") || "user1";

  // Find the recipient using _id fields
  const toUser = currentConversation?.participants?.find(
    (p) => p._id.toString() !== currentUser
  );

  const socket = useSocket();

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: uuidv4(),
      room_id: currentConversation._id,
      from: currentUser,
      to: toUser._id,
      timestamp: new Date().toISOString(),
      text: messageText,
      type: "text"
    };

    dispatch(AddDirectMessage({ message: newMessage }));

    socket.emit("text_message", {
      text: newMessage.text,
      conversation_id: newMessage.room_id,
      from: newMessage.from,
      to: newMessage.to,
      type: newMessage.type,
    });

    setMessageText("");
  };

  return (
    <footer className="p-4 border-t border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-slate-800">
      <div className="flex">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-blue-300 dark:border-blue-600 rounded-full 
                   bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 
                   focus:border-blue-400 dark:focus:border-blue-500
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 
                   text-white rounded-full hover:from-blue-600 hover:to-blue-700 
                   dark:hover:from-blue-700 dark:hover:to-blue-800 transition-colors"
        >
          Send
        </button>
      </div>
    </footer>
  );
};

// ChatPage: Combines header, conversation and footer.
export default function ChatPage() {
  const socket = useSocket();
  const { state } = useLocation();
  const { userData } = useUser();
  const matchedUser = state?.matchedUser || {};
  const dispatch = useDispatch();
  const { room_id } = useSelector((state) => state.app);
  const [message, setMessage] = useState("");
  const currentConversation = useSelector(
    (state) => state.conversation.direct_chat.current_conversation
  );

  // Handler for starting a chat conversation
  const handleChatStarted = useCallback((conversationData) => {
    if (!conversationData || !conversationData._id) {
      console.error("Invalid conversation data received");
      return;
    }
    const convId = conversationData._id;
    
    // Store the full conversation data.
    dispatch(SelectConversation({
      chat_type: "direct_chat",
      room_id: convId,
      conversation: conversationData
    }));
    console.log("ChatPage selected conversation:", conversationData);
    dispatch(SetCurrentConversation(conversationData));
    
    // Fetch conversation messages.
    socket.emit("get_messages", { conversation_id: convId }, (messages) => {
      console.log("ChatPage received get_messages:", messages);
      if (messages && !messages.error) {
        dispatch(FetchCurrentMessages({ messages, conversation_id: convId }));
      }
      dispatch(SetCurrentConversation(conversationData));
    });
  }, [dispatch, socket]);

  // Handler for incoming new messages.
  const handleNewMessage = useCallback((data) => {
    const message = data.message;
    console.log("new_message event received:", data);
    if (
      message.to === userData._id &&
      currentConversation?._id === data.conversation_id
    ) {
      const formattedMessage = {
        id: message._id,
        room_id: message.conversation_id,
        type: message.type,
        text: message.text,
        file: message.file,
        from: message.from,
        to: message.to,
        timestamp: message.createdAt || new Date().toISOString()
      };
      console.log("Formatted new message:", formattedMessage);
      dispatch(AddDirectMessage({ message: formattedMessage }));
    }
  }, [dispatch, userData._id, currentConversation]);

  useEffect(() => {
    if (userData && matchedUser._id && socket?.connected) {
      // Listen for events.
      socket.on("start_chat", handleChatStarted);
      socket.on("get_messages", (data) => {
        console.log("get_messages event received:", data);
        if (data && data.messages) {
          dispatch(FetchCurrentMessages({ messages: data.messages, conversation_id: data.conversation_id }));
          dispatch(SetCurrentConversation(data));
        }
      });
      socket.on("new_message", handleNewMessage);
      socket.on("text_message_error", (error) => {
        console.error("Message send failed:", error);
        alert(`Send failed: ${error.error}`);
      });

      // Initiate chat by emitting start_chat.
      socket.emit("start_chat", {
        from: userData._id,
        to: matchedUser._id
      }, (response) => {
        console.log("ChatPage start_chat response:", response);
        if (response.error) {
          console.error("Error starting chat:", response.error);
          return;
        }
        handleChatStarted(response);
      });
    }

    // Cleanup on unmount.
    return () => {
      socket?.off("start_chat", handleChatStarted);
      socket?.off("get_messages");
      socket?.off("new_message", handleNewMessage);
      socket?.off("text_message_error");
    };
  }, [socket, dispatch, handleChatStarted]);

  useEffect(() => {
    if (socket?.connected && userData?._id && matchedUser?._id) {
      socket.emit("start_chat", {
        from: userData._id,
        to: matchedUser._id
      });
    }
  }, [socket?.connected, userData?._id, matchedUser?._id]);

  useEffect(() => {
    if (socket) {
      const handleError = (error) => {
        console.error('Socket error:', error);
        // Dispatch error to Redux store if needed
      };

      socket.on('connect_error', handleError);
      socket.on('error', handleError);

      return () => {
        socket.off('connect_error', handleError);
        socket.off('error', handleError);
      };
    }
  }, [socket]);

  // On mount, if no conversation is selected, dispatch a dummy conversation.
  useEffect(() => {
    if (!currentConversation) {
      // Only create dummy if no conversation exists
      const dummyConversation = {
        id: "room1",
        participants: [
          { id: "user1", name: "Alice", profilePic: "https://i.pravatar.cc/40?img=1" },
          { id: "user2", name: "Bob", profilePic: "https://i.pravatar.cc/40?img=2" },
        ],
        user_id: "user2",
      };
      dispatch(SelectConversation({ chat_type: "direct_chat", room_id: dummyConversation.id }));
    }
  }, [dispatch]); // Only run once on mount

  console.log("Conversation ID:", currentConversation?._id);

  return (
    <div className="max-h-[80vh] min-h-[80vh] flex flex-col bg-white dark:bg-slate-900">
      <ChatHeader />
      <Conversation />
      <ChatFooter />
    </div>
  );
}