import io from "socket.io-client";

// Use the same origin as your API requests
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

let socket;

const connectSocket = (user_id) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { user_id }, // Fixed: Use object format for query
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"], // Force WebSocket transport
      autoConnect: true,
    });

    console.log("Attempting connection to:", SOCKET_URL);

    socket.on("connect", () => {
      console.log("Socket connected successfully. ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });
  }
  return socket;
};

export { socket, connectSocket };
