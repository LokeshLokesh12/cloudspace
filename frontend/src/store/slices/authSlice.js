import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import socketService from '../../services/socket';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data.data; // contains { user, accessToken }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data.data; // contains { user, accessToken }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      socketService.disconnect();
      localStorage.removeItem('accessToken');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const verifyEmailToken = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend verification email');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset link');
    }
  }
);

export const resetPasswordConfirm = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-password', { currentPassword, newPassword });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
  authChecked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    refreshTokenSuccess: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.token);
      socketService.connect(action.payload.token);
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.accessToken);
        socketService.connect(action.payload.accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.accessToken);
        socketService.connect(action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
        if (state.token) {
          socketService.connect(state.token);
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.authChecked = true;
        localStorage.removeItem('accessToken');
        socketService.disconnect();
      })
      // Verify Email
      .addCase(verifyEmailToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyEmailToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(verifyEmailToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change Password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { refreshTokenSuccess, clearError, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
