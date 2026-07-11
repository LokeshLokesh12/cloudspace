import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { fetchFolderContents } from './folderSlice';

export const fetchRecentFiles = createAsyncThunk(
  'files/fetchRecent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/files/recent');
      return response.data.data.files;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent files');
    }
  }
);

export const fetchStorageInfo = createAsyncThunk(
  'files/fetchStorage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/files/storage');
      return response.data.data.storage; // { storageLimit, storageUsed, percentage, plan }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch storage info');
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'files/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/files/dashboard');
      return response.data.data; // { storage, recentFiles, recentActivity }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const renameFile = createAsyncThunk(
  'files/rename',
  async ({ fileId, originalName }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/files/${fileId}/rename`, { originalName });
      return response.data.data.file;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rename file');
    }
  }
);

export const moveFile = createAsyncThunk(
  'files/move',
  async ({ fileId, targetFolderId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/files/${fileId}/move`, { targetFolderId });
      return response.data.data.file;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move file');
    }
  }
);

export const copyFile = createAsyncThunk(
  'files/copy',
  async ({ fileId, targetFolderId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/files/${fileId}/copy`, { targetFolderId });
      return response.data.data.file;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to copy file');
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/delete',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/files/${fileId}`);
      return { fileId, file: response.data.data.file };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete file');
    }
  }
);

// Trash Actions
export const fetchTrash = createAsyncThunk(
  'files/fetchTrash',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/trash');
      return response.data.data; // { files, folders }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trash');
    }
  }
);

export const restoreFile = createAsyncThunk(
  'files/restoreFile',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/trash/files/${fileId}/restore`);
      return response.data.data.file;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to restore file');
    }
  }
);

export const restoreFolder = createAsyncThunk(
  'files/restoreFolder',
  async (folderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/trash/folders/${folderId}/restore`);
      return response.data.data.folder;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to restore folder');
    }
  }
);

export const permanentDeleteFile = createAsyncThunk(
  'files/permanentDeleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      await api.delete(`/trash/files/${fileId}`);
      return fileId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to permanently delete file');
    }
  }
);

export const permanentDeleteFolder = createAsyncThunk(
  'files/permanentDeleteFolder',
  async (folderId, { rejectWithValue }) => {
    try {
      await api.delete(`/trash/folders/${folderId}`);
      return folderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to permanently delete folder');
    }
  }
);

export const emptyTrash = createAsyncThunk(
  'files/emptyTrash',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/trash/empty');
      return response.data.data; // { deletedFiles, deletedFolders }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to empty trash');
    }
  }
);

// File upload thunk with Axios progress reporting
export const uploadFileWithProgress = createAsyncThunk(
  'files/uploadWithProgress',
  async ({ file, folderId, uploadId }, { dispatch, rejectWithValue }) => {
    const formData = new FormData();
    formData.append('file', file);

    const cancelSource = axios.CancelToken.source();

    // Register file in local state queue
    dispatch(addUploadToQueue({
      id: uploadId,
      fileName: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      cancelSource,
    }));

    try {
      const q = folderId ? `?folderId=${folderId}` : '';
      const response = await api.post(`/files/upload${q}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        cancelToken: cancelSource.token,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          dispatch(updateUploadProgress({ id: uploadId, progress: percentCompleted }));
        },
      });

      dispatch(updateUploadStatus({ id: uploadId, status: 'success' }));
      dispatch(fetchStorageInfo()); // reload storage info
      return response.data.data.file;
    } catch (error) {
      if (axios.isCancel(error)) {
        dispatch(updateUploadStatus({ id: uploadId, status: 'cancelled' }));
        return rejectWithValue('Upload cancelled');
      }
      dispatch(updateUploadStatus({ id: uploadId, status: 'failed' }));
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

const initialState = {
  recentFiles: [],
  storageInfo: {
    storageLimit: 104857600, // 100 MB default
    storageUsed: 0,
    percentage: 0,
    plan: 'FREE',
  },
  trash: {
    files: [],
    folders: [],
  },
  uploadQueue: [],
  loading: false,
  error: null,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    // Local upload queue helpers
    addUploadToQueue: (state, action) => {
      const { id, fileName, size, progress, status, cancelSource } = action.payload;
      state.uploadQueue.push({ id, fileName, size, progress, status, cancelSource });
    },
    updateUploadProgress: (state, action) => {
      const { id, progress } = action.payload;
      const index = state.uploadQueue.findIndex((u) => u.id === id);
      if (index !== -1) {
        state.uploadQueue[index].progress = progress;
      }
    },
    updateUploadStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.uploadQueue.findIndex((u) => u.id === id);
      if (index !== -1) {
        state.uploadQueue[index].status = status;
      }
    },
    cancelUpload: (state, action) => {
      const id = action.payload;
      const index = state.uploadQueue.findIndex((u) => u.id === id);
      if (index !== -1) {
        if (state.uploadQueue[index].status === 'uploading' && state.uploadQueue[index].cancelSource) {
          state.uploadQueue[index].cancelSource.cancel('User cancelled upload');
        }
      }
    },
    clearCompletedUploads: (state) => {
      state.uploadQueue = state.uploadQueue.filter(
        (u) => u.status === 'uploading'
      );
    },
    // Socket.IO event handlers to dynamically update state
    socketFileUploaded: (state, action) => {
      const { file } = action.payload;
      // Add to recent files
      if (!state.recentFiles.some((f) => f._id === file._id)) {
        state.recentFiles.unshift(file);
        if (state.recentFiles.length > 10) state.recentFiles.pop();
      }
      // Re-trigger storage reload
      state.storageInfo.storageUsed += file.size;
      state.storageInfo.percentage = Math.round((state.storageInfo.storageUsed / state.storageInfo.storageLimit) * 100);
    },
    socketFileRenamed: (state, action) => {
      const { file } = action.payload;
      const recentIndex = state.recentFiles.findIndex((f) => f._id === file._id);
      if (recentIndex !== -1) {
        state.recentFiles[recentIndex] = file;
      }
    },
    socketFileDeleted: (state, action) => {
      const { fileId } = action.payload;
      state.recentFiles = state.recentFiles.filter((f) => f._id !== fileId);
    },
    socketFileRestored: (state, action) => {
      const { file } = action.payload;
      if (!state.recentFiles.some((f) => f._id === file._id)) {
        state.recentFiles.unshift(file);
      }
      state.storageInfo.storageUsed += file.size;
      state.storageInfo.percentage = Math.round((state.storageInfo.storageUsed / state.storageInfo.storageLimit) * 100);
    },
    socketTrashEmptied: (state) => {
      state.trash = { files: [], folders: [] };
    },
    clearFileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Recent Files
      .addCase(fetchRecentFiles.fulfilled, (state, action) => {
        state.recentFiles = action.payload;
      })
      // Fetch Storage Info
      .addCase(fetchStorageInfo.fulfilled, (state, action) => {
        state.storageInfo = action.payload;
      })
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.storageInfo = action.payload.storage;
        state.recentFiles = action.payload.recentFiles;
      })
      // Fetch Trash
      .addCase(fetchTrash.fulfilled, (state, action) => {
        state.trash = action.payload;
      })
      // Delete File (Soft Delete)
      .addCase(deleteFile.fulfilled, (state, action) => {
        const { fileId, file } = action.payload;
        state.recentFiles = state.recentFiles.filter((f) => f._id !== fileId);
        if (file) {
          state.storageInfo.storageUsed = Math.max(0, state.storageInfo.storageUsed - file.size);
          state.storageInfo.percentage = Math.round((state.storageInfo.storageUsed / state.storageInfo.storageLimit) * 100);
        }
      })
      // Restore File from Trash
      .addCase(restoreFile.fulfilled, (state, action) => {
        const restored = action.payload;
        state.trash.files = state.trash.files.filter((f) => f._id !== restored._id);
        state.storageInfo.storageUsed += restored.size;
        state.storageInfo.percentage = Math.round((state.storageInfo.storageUsed / state.storageInfo.storageLimit) * 100);
      })
      // Restore Folder from Trash
      .addCase(restoreFolder.fulfilled, (state, action) => {
        const restored = action.payload;
        state.trash.folders = state.trash.folders.filter((f) => f._id !== restored._id);
      })
      // Permanent Delete File
      .addCase(permanentDeleteFile.fulfilled, (state, action) => {
        const fileId = action.payload;
        state.trash.files = state.trash.files.filter((f) => f._id !== fileId);
      })
      // Permanent Delete Folder
      .addCase(permanentDeleteFolder.fulfilled, (state, action) => {
        const folderId = action.payload;
        state.trash.folders = state.trash.folders.filter((f) => f._id !== folderId);
      })
      // Empty Trash
      .addCase(emptyTrash.fulfilled, (state) => {
        state.trash = { files: [], folders: [] };
      })
      // Upload File with Progress Success
      .addCase(uploadFileWithProgress.fulfilled, (state, action) => {
        const file = action.payload;
        if (!state.recentFiles.some((f) => f._id === file._id)) {
          state.recentFiles.unshift(file);
        }
      });
  },
});

export const {
  addUploadToQueue,
  updateUploadProgress,
  updateUploadStatus,
  cancelUpload,
  clearCompletedUploads,
  socketFileUploaded,
  socketFileRenamed,
  socketFileDeleted,
  socketFileRestored,
  socketTrashEmptied,
  clearFileError,
} = fileSlice.actions;
export default fileSlice.reducer;
