import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface FriendListState {
    friends: string[];
}

const initialState: FriendListState = {
    friends: [],
};

const friendsSlice = createSlice({
  name: 'friendList',
  initialState,
  reducers: {
    addFriend: (state, action: PayloadAction<string>) => {
        state.friends.push(action.payload);
      }
    }
});

export const { addFriend } = friendsSlice.actions;
export default friendsSlice.reducer;
