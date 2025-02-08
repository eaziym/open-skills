import { createSlice } from "@reduxjs/toolkit";

// Retrieve the user_id from local storage
const user_id = window.localStorage.getItem("user_id");

// Define the initial state for the conversation slice
const initialState = {
  direct_chat: {
    conversations: [], // List of direct conversations
    current_conversation: null, // Currently active conversation
    current_messages: [], // Messages in the current conversation
    cached_messages: {}, // Add this to cache messages by conversation ID
    loading: false, // Add this
  },
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Create a slice for conversation management
const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    // Fetch and format direct conversations
    fetchDirectConversations(state, action) {
      const list = action.payload.conversations.map((el) => {
        // Find the user in the conversation who is not the current user
        const user = el.participants.find(
          (elm) => elm._id.toString() !== user_id
        );
        const lastMessage = el.messages.slice(-1)[0];
        return {
          id: el._id,
          user_id: user?._id,
          name: `${user?.firstName} ${user?.lastName}`,
          online: user?.status === "Online",
          img: `https://${S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${user?.avatar}`,
          msg: lastMessage?.message || "",
          time: lastMessage ? formatTimestamp(lastMessage.createdAt) : "",
          unread: el.unread || 0,
          pinned: el.pinned || false,
          about: user?.about,
        };
      });

      // Update the state with the formatted list of conversations
      state.direct_chat.conversations = list;
    },
    // Update a specific direct conversation
    updateDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el?.id !== this_conversation._id) {
            return el; // Return unchanged if not the target conversation
          } else {
            // Find the user in the conversation who is not the current user
            const user = this_conversation.participants.find(
              (elm) => elm._id.toString() !== user_id
            );
            const lastMessage = this_conversation.messages.slice(-1)[0];
            return {
              id: this_conversation._id,
              user_id: user?._id,
              name: `${user?.firstName} ${user?.lastName}`,
              online: user?.status === "Online",
              img: `https://${S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${user?.avatar}`,
              msg: lastMessage?.message || "",
              time: lastMessage ? formatTimestamp(lastMessage.createdAt) : "",
              unread: el.unread || 0,
              pinned: el.pinned || false,
              about: user?.about,
            };
          }
        }
      );
    },

    // Add a new direct conversation
    addDirectConversation(state, action) {
      console.log(action.payload);
      const this_conversation = action.payload.conversation;
      const user = this_conversation.participants.find(
        (elm) => elm._id.toString() !== user_id
      );

      // Check if the conversation already exists
      const exists = state.direct_chat.conversations.some(
        (el) => el?.id === this_conversation._id
      );

      // Only add the conversation if it does not exist
      if (!exists) {
        state.direct_chat.conversations.push({
          id: this_conversation._id,
          user_id: user?._id,
          name: `${user?.firstName} ${user?.lastName}`,
          online: user?.status === "online",
          img: faker.image.avatar(), // Placeholder image
          msg: "",
          time: new Date().toISOString(),
          unread: 0, // Placeholder for unread messages count
          pinned: false, // Placeholder for pinned status
        });
      }
    },
    // Set the current active conversation
    setCurrentConversation(state, action) {
      state.direct_chat.current_conversation = action.payload;
    },

    // Fetch and format messages for the current conversation
    fetchCurrentMessages(state, action) {
      const messages = action.payload.messages;
      const conversation_id = action.payload.conversation_id;

      if (!Array.isArray(messages)) {
        state.direct_chat.current_messages = [];
        return;
      }

      console.log("fetchCurrentMessages", messages);

      // If this is from cache, show immediately
      if (action.payload.fromCache) {
        state.direct_chat.current_messages = messages;
      } else {
        // If this is fresh data, only update if messages have changed
        const currentMessages = JSON.stringify(
          state.direct_chat.current_messages
        );
        const newMessages = JSON.stringify(messages);
        if (currentMessages !== newMessages) {
          state.direct_chat.current_messages = messages;
        }
      }

      // Always update cache with fresh data if not from cache
      if (!action.payload.fromCache && conversation_id) {
        state.direct_chat.cached_messages[conversation_id] = messages;
      }
    },
    // Add a new message to the current conversation
    addDirectMessage(state, action) {
      console.log("addDirectMessage", action.payload);
      const { message } = action.payload;

      // Only add the message if it belongs to the active direct conversation.
      const activeConversation = state.direct_chat.current_conversation;
      if (activeConversation?._id !== message.room_id) {
        return;
      }

      if (!Array.isArray(state.direct_chat.current_messages)) {
        state.direct_chat.current_messages = [];
      }
      state.direct_chat.current_messages.push(message);
    },
    cacheMessages(state, action) {
      const { conversation_id, messages } = action.payload;
      state.direct_chat.cached_messages[conversation_id] = messages;
    },
    setLoading(state, action) {
      state.direct_chat.loading = action.payload;
    },
  },
});

// Export the actions directly from the slice
export const {
  fetchDirectConversations,
  updateDirectConversation,
  addDirectConversation,
  setCurrentConversation,
  fetchCurrentMessages,
  addDirectMessage,
  cacheMessages,
  setLoading,
} = slice.actions;

export const SetCurrentConversation = (current_conversation) => {
  return async (dispatch) => {
    try {
      dispatch(setCurrentConversation(current_conversation));
      return true;
    } catch (error) {
      console.error("Failed to set conversation:", error);
      return false;
    }
  };
};

export const AddDirectMessage = ({ message }) => {
  return async (dispatch) => {
    try {
      dispatch(addDirectMessage({ message }));
      return true;
    } catch (error) {
      console.error("Failed to add message:", error);
      return false;
    }
  };
};

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

// Action to fetch direct conversations
export const FetchDirectConversations = ({ conversations }) => {
  return async (dispatch, getState) => {
    console.log("Fetching conversations", conversations);
    dispatch(slice.actions.fetchDirectConversations({ conversations }));
  };
};

// Action to add a new direct conversation
export const AddDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectConversation({ conversation }));
  };
};

// Action to update an existing direct conversation
export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
  };
};

// Action to fetch messages for the current conversation
export const FetchCurrentMessages = ({ messages }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchCurrentMessages({ messages }));
  };
};
