import { createSlice } from "@reduxjs/toolkit";
import Axios from "axios";

// ----------------------------------------------------------------------

const initialState = {
  user: {},
  isLoggedIn: true,
  chat_type: null,
  room_id: null,
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    selectConversation(state, action) {
      state.chat_type = action.payload.chat_type;
      state.room_id = action.payload.room_id;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const SelectConversation = ({ chat_type, room_id }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.selectConversation({ chat_type, room_id }));
  };
};
