import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    type DocumentData
  } from "firebase/firestore";
  import { db } from "../firebase";
  
  // === Firestore Service ===
  
  /**
   * Add a document to a collection (Random ID)
   */
  export const addDocument = async (collectionName: string, data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef;
    } catch (error) {
      console.error(`Error adding document directly to ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Set a document with a specific ID
   */
  export const setDocument = async (collectionName: string, docId: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true }); // Merge true ensures we don't overwrite if not intended
    } catch (error) {
      console.error(`Error setting document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Get a single document by ID
   */
  export const getDocument = async (collectionName: string, docId: string): Promise<DocumentData | undefined> => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.warn(`No such document: ${collectionName}/${docId}`);
        return undefined;
      }
    } catch (error) {
      console.error(`Error getting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Get all documents from a collection
   */
  export const getCollection = async (collectionName: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  };
  
  /**
   * Update a document
   */
  export const updateDocument = async (collectionName: string, docId: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error updating document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  };

  /**
   * Delete a document
   */
  export const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
           console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  };
