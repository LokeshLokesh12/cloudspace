import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '../../services/socket';
import {
  socketFileUploaded,
  socketFileRenamed,
  socketFileDeleted,
  socketFileRestored,
  socketTrashEmptied,
  fetchStorageInfo,
} from '../../store/slices/fileSlice';
import {
  socketFolderCreated,
  socketFolderRenamed,
  socketFolderMoved,
  socketFolderDeleted,
  socketFolderRestored,
  fetchFolderContents,
} from '../../store/slices/folderSlice';

export default function SocketListener() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const { currentFolderId } = useSelector((state) => state.folders);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to Socket.IO using the active auth token
      socketService.connect(token);

      // Register file action socket triggers
      socketService.on('file:uploaded', (data) => {
        dispatch(socketFileUploaded(data));
        // Force refresh folder contents if currently viewing target folder
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('files:uploaded', (data) => {
        if (data.files) {
          data.files.forEach((file) => {
            dispatch(socketFileUploaded({ file }));
          });
        }
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('file:renamed', (data) => {
        dispatch(socketFileRenamed(data));
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('file:deleted', (data) => {
        dispatch(socketFileDeleted(data));
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('file:restored', (data) => {
        dispatch(socketFileRestored(data));
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('file:moved', () => {
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('file:copied', () => {
        dispatch(fetchFolderContents(currentFolderId));
      });

      // Register folder action socket triggers
      socketService.on('folder:created', (data) => {
        dispatch(socketFolderCreated(data));
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('folder:renamed', (data) => {
        dispatch(socketFolderRenamed(data));
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('folder:moved', (data) => {
        dispatch(socketFolderMoved(data));
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('folder:deleted', (data) => {
        dispatch(socketFolderDeleted(data));
        dispatch(fetchFolderContents(currentFolderId));
      });

      socketService.on('folder:restored', (data) => {
        dispatch(socketFolderRestored(data));
        dispatch(fetchFolderContents(currentFolderId));
      });

      // Trash triggers
      socketService.on('trash:emptied', () => {
        dispatch(socketTrashEmptied());
        dispatch(fetchStorageInfo());
      });
    }

    return () => {
      // Disconnect socket on logout/unmount
      socketService.disconnect();
    };
  }, [isAuthenticated, token, currentFolderId, dispatch]);

  return null; // Side-effect rendering only
}
