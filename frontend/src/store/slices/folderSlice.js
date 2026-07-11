import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchFolderContents = createAsyncThunk(
  'folders/fetchContents',
  async (folderId, { rejectWithValue }) => {
    try {
      const q = folderId ? `?folderId=${folderId}` : '';
      const response = await api.get(`/folders/contents${q}`);
      return response.data.data; // { folders, files, currentFolderId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folder contents');
    }
  }
);

export const fetchBreadcrumb = createAsyncThunk(
  'folders/fetchBreadcrumb',
  async (folderId, { rejectWithValue }) => {
    try {
      const q = folderId ? `?folderId=${folderId}` : '';
      const response = await api.get(`/folders/breadcrumb${q}`);
      return response.data.data.breadcrumb; // Array of { _id, name }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch breadcrumb');
    }
  }
);

export const fetchFolderTree = createAsyncThunk(
  'folders/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/folders/tree');
      return response.data.data.tree;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folder tree');
    }
  }
);

export const createFolder = createAsyncThunk(
  'folders/create',
  async ({ name, parentFolderId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/folders', { name, parentFolderId });
      return response.data.data.folder;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create folder');
    }
  }
);

export const renameFolder = createAsyncThunk(
  'folders/rename',
  async ({ folderId, name }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/folders/${folderId}/rename`, { name });
      return response.data.data.folder;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rename folder');
    }
  }
);

export const moveFolder = createAsyncThunk(
  'folders/move',
  async ({ folderId, targetFolderId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/folders/${folderId}/move`, { targetFolderId });
      return response.data.data.folder;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move folder');
    }
  }
);

export const deleteFolder = createAsyncThunk(
  'folders/delete',
  async (folderId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/folders/${folderId}`);
      return { folderId, result: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete folder');
    }
  }
);

const initialState = {
  currentFolderId: null,
  folders: [],
  files: [],
  breadcrumb: [],
  tree: [],
  loading: false,
  error: null,
};

const folderSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    // Socket.IO event response handlers to dynamically sync state
    socketFolderCreated: (state, action) => {
      const { folder } = action.payload;
      if (folder.parentFolder?.toString() === state.currentFolderId?.toString() || 
          (!folder.parentFolder && !state.currentFolderId)) {
        if (!state.folders.some((f) => f._id === folder._id)) {
          state.folders.push(folder);
        }
      }
    },
    socketFolderRenamed: (state, action) => {
      const { folder } = action.payload;
      const index = state.folders.findIndex((f) => f._id === folder._id);
      if (index !== -1) {
        state.folders[index] = folder;
      }
      // Update name in breadcrumb if the updated folder is in the breadcrumb path
      const breadcrumbIndex = state.breadcrumb.findIndex((b) => b._id === folder._id);
      if (breadcrumbIndex !== -1) {
        state.breadcrumb[breadcrumbIndex].name = folder.name;
      }
    },
    socketFolderMoved: (state, action) => {
      const { folder } = action.payload;
      // If moved out of current folder
      if (folder.parentFolder?.toString() !== state.currentFolderId?.toString()) {
        state.folders = state.folders.filter((f) => f._id !== folder._id);
      } else {
        // If moved into current folder
        if (!state.folders.some((f) => f._id === folder._id)) {
          state.folders.push(folder);
        }
      }
    },
    socketFolderDeleted: (state, action) => {
      const { folderId } = action.payload;
      state.folders = state.folders.filter((f) => f._id !== folderId);
    },
    socketFolderRestored: (state, action) => {
      const { folder } = action.payload;
      if (folder.parentFolder?.toString() === state.currentFolderId?.toString()) {
        if (!state.folders.some((f) => f._id === folder._id)) {
          state.folders.push(folder);
        }
      }
    },
    // General UI cleanups
    clearFolderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch contents
      .addCase(fetchFolderContents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFolderContents.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = action.payload.folders;
        state.files = action.payload.files;
        state.currentFolderId = action.payload.currentFolderId;
      })
      .addCase(fetchFolderContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch breadcrumb
      .addCase(fetchBreadcrumb.fulfilled, (state, action) => {
        state.breadcrumb = action.payload;
      })
      // Fetch tree
      .addCase(fetchFolderTree.fulfilled, (state, action) => {
        state.tree = action.payload;
      })
      // Create folder
      .addCase(createFolder.fulfilled, (state, action) => {
        const folder = action.payload;
        if (!state.folders.some((f) => f._id === folder._id)) {
          state.folders.push(folder);
        }
      })
      // Rename folder
      .addCase(renameFolder.fulfilled, (state, action) => {
        const folder = action.payload;
        const index = state.folders.findIndex((f) => f._id === folder._id);
        if (index !== -1) {
          state.folders[index] = folder;
        }
      })
      // Move folder
      .addCase(moveFolder.fulfilled, (state, action) => {
        const folder = action.payload;
        state.folders = state.folders.filter((f) => f._id !== folder._id);
      })
      // Delete folder
      .addCase(deleteFolder.fulfilled, (state, action) => {
        const { folderId } = action.payload;
        state.folders = state.folders.filter((f) => f._id !== folderId);
      });
  },
});

export const {
  socketFolderCreated,
  socketFolderRenamed,
  socketFolderMoved,
  socketFolderDeleted,
  socketFolderRestored,
  clearFolderError,
} = folderSlice.actions;
export default folderSlice.reducer;
