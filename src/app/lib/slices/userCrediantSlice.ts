import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface UserCredentialsState {
    email: string;
    phone: string;
    password: string;
}

const initialState: UserCredentialsState = {
    email: '',
    phone: '',
    password: ''
};

const userCredentialsSlice = createSlice({
  name: 'userCredentials',
  initialState,
  reducers: {
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword:
    (state, action: PayloadAction<string>) => {
        state.password = action.payload;
      },
  },
});

export const { setPhone, setEmail, setPassword } = userCredentialsSlice.actions;
export default userCredentialsSlice.reducer;
