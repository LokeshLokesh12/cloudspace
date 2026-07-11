import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import fileReducer from './slices/fileSlice';
import folderReducer from './slices/folderSlice';
import { injectStore } from '../services/api';

const store = configureStore({
  reducer: {
    auth: authReducer,
    files: fileReducer,
    folders: folderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore custom structures like CancelToken in action payloads
        ignoredActions: ['files/uploadWithProgress/pending', 'files/addUploadToQueue'],
        ignoredActionPaths: ['meta.arg.cancelSource', 'payload.cancelSource'],
        ignoredPaths: ['files.uploadQueue'],
      },
    }),
});

// Inject store instance into API service to handle dynamic auth headers
injectStore(store);

export default store;
