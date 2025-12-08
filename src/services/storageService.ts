import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { storage } from "../firebase";

// === Storage Service ===

/**
 * Upload a file to Firebase Storage
 * path: e.g. "images/profile.jpg"
 */
export const uploadFile = async (path: string, file: File) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return snapshot;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Get Download URL for a file
 */
export const getFileUrl = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (path: string) => {
  try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
  } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
  }
};
