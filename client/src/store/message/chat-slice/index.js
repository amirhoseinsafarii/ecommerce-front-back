import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  messages: [],
  users: [],
  selectedUser: JSON.parse(sessionStorage.getItem("selectedUser")) || null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isLoading: false,
  isLoadingm: false,
};

export const getUsers = createAsyncThunk("/message/getUsers", async (user) => {
  const result = await axios.get(
    "http://localhost:5000/api/message/users",
    user
  );
  return result?.data;
});

export const getMessages = createAsyncThunk(
  "/message/getMessages",
  async (userId, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        `http://localhost:5000/api/message/${userId}`,
        {
          withCredentials: true,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
      return result?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async (messageData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const selectedUser =
        state.chat.selectedUser ||
        JSON.parse(sessionStorage.getItem("selectedUser"));

      if (!selectedUser?._id) {
        throw new Error("No selected user found");
      }

      const response = await axios.post(
        `http://localhost:5000/api/message/send/${selectedUser._id}`,
        messageData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  }
);

// New thunk for handling real-time messages
export const handleSocketMessage = createAsyncThunk(
  "chat/handleSocketMessage",
  async (message, { getState }) => {
    const { selectedUser } = getState().chat;

    if (
      selectedUser &&
      (message.senderId === selectedUser._id ||
        message.receiverId === selectedUser._id)
    ) {
      return message;
    }
    return null;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.messages = [];
      sessionStorage.setItem("selectedUser", JSON.stringify(action.payload));
    },
    addNewMessage: (state, action) => {
      const newMessage = action.payload;
      if (!newMessage?._id) return;

      // Ensure messages is an array
      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }

      // Check if message already exists
      const exists = state.messages.some((msg) => msg._id === newMessage._id);
      if (!exists) {
        state.messages = [...state.messages, newMessage];
      }
    },
    updateMessages: (state, action) => {
      // Handle array of messages
      const newMessages = Array.isArray(action.payload) ? action.payload : [];
      const currentMessages = Array.isArray(state.messages)
        ? state.messages
        : [];

      // Create a Set of existing message IDs
      const existingIds = new Set(currentMessages.map((msg) => msg._id));

      // Filter out duplicates and add new messages
      const uniqueNewMessages = newMessages.filter(
        (msg) => msg?._id && !existingIds.has(msg._id)
      );

      state.messages = [...currentMessages, ...uniqueNewMessages];
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getUsers.rejected, (state) => {
        state.isLoading = false;
        state.users = [];
      })
      .addCase(getMessages.pending, (state) => {
        state.isLoadingm = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoadingm = false;
        if (Array.isArray(action.payload)) {
          state.messages = action.payload;
        }
      })
      .addCase(getMessages.rejected, (state) => {
        state.isLoadingm = false;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isLoadingm = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoadingm = false;
        const newMessage = action.payload.data;
        if (newMessage?._id) {
          const exists = state.messages.some(
            (msg) => msg._id === newMessage._id
          );
          if (!exists) {
            state.messages = [...state.messages, newMessage];
          }
        }
      })
      .addCase(sendMessage.rejected, (state) => {
        state.isLoadingm = false;
      })
      .addCase(handleSocketMessage.fulfilled, (state, action) => {
        if (action.payload) {
          state.messages.push(action.payload);
        }
      });
  },
});

export const { setSelectedUser, updateMessages, clearMessages, addNewMessage } =
  chatSlice.actions;
export default chatSlice.reducer;
