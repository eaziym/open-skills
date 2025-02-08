const User = require("../models/userModel");
const OneToOneMessage = require("../models/oneToOneMessageModel");
const { v4: uuidv4 } = require("uuid");
module.exports = (io) => {
  io.on("connection", async (socket) => {
    try {
      const user_id = socket.handshake.query["user_id"];

      if (!user_id) {
        throw new Error("No user ID provided");
      }

      // Immediately update socket ID and status
      const user = await User.findByIdAndUpdate(
        user_id,
        {
          $set: {
            socket_id: socket.id,
            status: "online",
            lastSeen: null, // Clear last seen when online
          },
        },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found during connection");
      }

      console.log(
        `User ${user.username} connected with socket ID ${socket.id}`
      );

      // Disconnect previous connections for the same user
      const activeSockets = await io.fetchSockets();
      activeSockets.forEach((s) => {
        if (s.handshake.query.user_id === user_id && s.id !== socket.id) {
          console.log(`Disconnecting duplicate socket ${s.id}`);
          s.disconnect(true);
        }
      });

      // Update the socket's user reference with fresh data
      socket.user = user;

      // Add disconnect handler
      socket.on("disconnect", async () => {
        try {
          // Check if there are any remaining sockets for this user
          const remainingSockets = Array.from(
            io.sockets.sockets.values()
          ).filter((s) => s.handshake.query.user_id === user_id);

          if (remainingSockets.length === 0) {
            await User.findByIdAndUpdate(user_id, {
              $set: {
                status: "offline",
                lastSeen: new Date(),
                socket_id: null,
              },
            });
            console.log(`User ${user.username} fully disconnected`);
          } else {
            console.log(
              `User ${user.username} still has ${remainingSockets.length} active connections`
            );
          }
        } catch (error) {
          console.error("Disconnect error:", error);
        }
      });

      // socket event listeners

      socket.on("get_direct_conversations", async ({ user_id }, callback) => {
        try {
          const existing_conversations = await OneToOneMessage.find({
            participants: { $all: [user_id] },
          }).populate("participants", "firstName lastName _id email status");

          if (!existing_conversations) {
            console.log("No conversations found for user:", user_id);
            callback([]);
          } else {
            console.log("get_direct_conversations", existing_conversations);
            callback(existing_conversations);
          }
        } catch (error) {
          console.error("Error fetching direct conversations:", error);
          callback({ error: "Failed to fetch conversations" });
        }
      });

      socket.on("start_chat", async (data, callback) => {
        // data: { to, from }
        const { to, from } = data;

        const existing_conversation = await OneToOneMessage.findOne({
          participants: { $size: 2, $all: [to, from] },
        }).populate("participants", "firstName lastName _id email status");

        console.log("start_chat", existing_conversation);

        if (!existing_conversation) {
          const new_chat = await OneToOneMessage.create({
            participants: [to, from],
          });
          const populated_chat = await OneToOneMessage.findById(
            new_chat._id
          ).populate("participants", "firstName lastName _id email status");

          console.log("new_chat", populated_chat);
          // Only respond if callback exists
          if (typeof callback === "function") {
            callback(populated_chat);
          }
        } else {
          // Only respond if callback exists
          if (typeof callback === "function") {
            callback(existing_conversation);
          }
        }
      });

      socket.on("get_messages", async (data, callback) => {
        try {
          console.log("get_messages", data);
          const { conversation_id } = data;
          const conversation = await OneToOneMessage.findById(conversation_id);

          // Always check if callback exists before calling
          if (typeof callback === "function") {
            if (!conversation) {
              callback([]);
            } else {
              callback(conversation.messages);
            }
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          if (typeof callback === "function") {
            callback({ error: "Unable to fetch messages" });
          }
        }
      });

      // Handle text/link messages
      socket.on("text_message", async (data) => {
        try {
          console.log("Received text message", data);

          const { to, from, text, conversation_id, type } = data;

          const to_user = await User.findById(to);
          const from_user = await User.findById(from);

          const new_message = {
            id: uuidv4(),
            to,
            from,
            type,
            text,
            conversation_id,
            createdAt: Date.now(),
          };

          let chat;
          chat = await OneToOneMessage.findById(conversation_id);
          if (!chat) {
            chat = await OneToOneMessage.create({
              participants: [to, from],
            });
          }

          chat.messages.push(new_message);
          await chat.save();
          console.log("new_message", new_message);
          io.to(to_user.socket_id).emit("new_message", {
            conversation_id,
            message: new_message,
          });
          console.log("emitted new_message to", to_user.socket_id);

          io.to(from_user.socket_id).emit("new_message", {
            conversation_id,
            message: new_message,
          });
          console.log("emitted new_message to", from_user.socket_id);
        } catch (error) {
          console.error("Error handling text message:", error);
          socket.emit("text_message_error", { error: error.message });
        }
      });

      // Get all users for mentions
      socket.on("get_all_users", async (data, callback) => {
        try {
          const users = await User.find({
            _id: { $ne: socket.user._id }, // Exclude current user
          }).select("fname lname _id status");

          callback({
            users: users.map((user) => ({
              _id: user._id,
              firstName: user.fname,
              lastName: user.lname,
              status: user.status,
            })),
          });
        } catch (error) {
          console.error("Error fetching users:", error);
          callback({ error: "Failed to fetch users" });
        }
      });

      // Get conversation history with a specific user
      socket.on("get_conversation_history", async ({ userId }, callback) => {
        try {
          if (!socket.user) {
            throw new Error("User not authenticated");
          }

          // Find the conversation between the two users
          const conversation = await OneToOneMessage.findOne({
            participants: {
              $all: [socket.user._id, userId],
              $size: 2,
            },
          })
            .populate("messages.from", "fname lname")
            .sort({ "messages.createdAt": -1 })
            .limit(50);

          if (!conversation) {
            callback({ history: [] });
            return;
          }

          // Format messages for LLM context
          const history = conversation.messages.map((msg) => ({
            message: msg.text,
            from:
              msg.from._id.toString() === userId
                ? `${msg.from.fname} ${msg.from.lname}`
                : "You",
            timestamp: msg.createdAt,
          }));

          callback({ history: history.reverse() });
        } catch (error) {
          console.error("Error fetching conversation history:", error);
          callback({
            error: "Failed to fetch conversation history",
            details: error.message,
          });
        }
      });

      socket.on("new_message", async (data, callback) => {
        try {
          const { message } = data;
          // Construct the new message object including the required 'type'
          const newMessage = {
            id: Date.now(), // or use a better unique ID generator
            room_id: message.room_id,
            from: message.from,
            to: message.to,
            text: message.text,
            type: message.type, // ensure the type field is included
            createdAt: new Date().toISOString(),
          };

          // Persist the new message by updating the conversation
          await OneToOneMessage.findByIdAndUpdate(
            message.room_id,
            { $push: { messages: newMessage } },
            { new: true }
          );

          const to_user = await User.findById(to);
          const from_user = await User.findById(from);

          // Emit new_message to receiver and sender with structured data
          io.to(to_user.socket_id).emit("new_message", {
            conversation_id: message.room_id,
            message: newMessage,
          });
          io.to(from_user.socket_id).emit("new_message", {
            conversation_id: message.room_id,
            message: newMessage,
          });

          // Only call callback if provided
          if (typeof callback === "function") {
            callback({ success: true, message: newMessage });
          }
        } catch (error) {
          console.error("Error processing new_message event:", error);
          if (typeof callback === "function") {
            callback({ error: "Failed to send message." });
          }
        }
      });
    } catch (error) {
      console.error("Connection error:", error);
      socket.disconnect(true);
    }
  });

  process.on("unhandledRejection", (err) => {
    console.log(err);
    console.log("UNHANDLED REJECTION! Shutting down...");
    process.exit(1);
  });
};
