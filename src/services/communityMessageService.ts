import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { User } from "../context/AuthContext";
import { formatFullDateTime } from "../utils/dateUtils";

const MESSAGE_COLLECTION = "communityMessages";

export interface CommunityMessage {
  id: string;
  communityId: string; // e.g. "3k56j3PFRpLJpsyRWQyo"
  userId: string; // e.g. "7TJmAlPuCddzSjNmmBt0vZRe1Tc2"
  userName: string; // e.g. "Admin User"
  userPhoto: string | null; // e.g. "https://i.pravatar.cc/150?img=68"
  content: string; // e.g. "hi smit"
  createdAt: Timestamp; // Using Firebase Timestamp instead of string
  timestamp: Timestamp; // Firebase Timestamp object
  clientTimestamp: number; // e.g. 1744981048752
}

// Convert Firestore document to CommunityMessage object
export const convertMessage = (doc: any): CommunityMessage => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
  };
};

// Get messages for a specific community
export const getCommunityMessages = async (
  communityId: string,
  messagesLimit = 50
) => {
  try {
    const messagesRef = collection(db, MESSAGE_COLLECTION);

    // Try to use the preferred query with compound index
    try {
      const q = query(
        messagesRef,
        where("communityId", "==", communityId),
        orderBy("clientTimestamp", "asc"),
        limit(messagesLimit)
      );

      const querySnapshot = await getDocs(q);
      const messages: CommunityMessage[] = [];

      querySnapshot.forEach((doc) => {
        messages.push(convertMessage(doc));
      });

      return messages;
    } catch (indexError) {
      console.warn("Index error, falling back to simple query:", indexError);

      // Fallback to a simple query without ordering
      // This will work without the composite index, but messages might not be in order
      const fallbackQuery = query(
        messagesRef,
        where("communityId", "==", communityId),
        limit(messagesLimit)
      );

      const fallbackSnapshot = await getDocs(fallbackQuery);
      let fallbackMessages: CommunityMessage[] = [];

      fallbackSnapshot.forEach((doc) => {
        fallbackMessages.push(convertMessage(doc));
      });

      // Sort manually on the client side (not as efficient but works without index)
      fallbackMessages = fallbackMessages.sort((a, b) => {
        return (a.clientTimestamp || 0) - (b.clientTimestamp || 0);
      });

      // Show a console message to remind about creating the index
      console.info(
        "For better performance, please create the missing index using the link in the previous error message"
      );

      return fallbackMessages;
    }
  } catch (error) {
    console.error("Error getting community messages:", error);
    throw error;
  }
};

// Send a new message to a community
export const sendCommunityMessage = async (
  communityId: string,
  content: string,
  currentUser: User
) => {
  try {
    // Current date for timestamps
    const now = new Date();
    const clientTimestamp = Date.now(); // Unix timestamp in milliseconds

    const messageData = {
      communityId,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhoto: currentUser.avatar || null,
      content,
      createdAt: Timestamp.fromDate(now), // Using Firebase Timestamp instead of ISO string
      timestamp: serverTimestamp(), // Using Firebase server timestamp (will be a Timestamp object)
      clientTimestamp,
    };

    const docRef = await addDoc(
      collection(db, MESSAGE_COLLECTION),
      messageData
    );

    // Get the message with the ID
    const docSnapshot = await getDoc(docRef);
    return convertMessage(docSnapshot);
  } catch (error) {
    console.error("Error sending community message:", error);
    throw error;
  }
};

// Update a message (only allowed for message owner, admin, or community author)
export const updateCommunityMessage = async (
  messageId: string,
  content: string
) => {
  try {
    const messageRef = doc(db, MESSAGE_COLLECTION, messageId);

    // Current date
    const now = new Date();
    const clientTimestamp = Date.now();

    await updateDoc(messageRef, {
      content,
      updatedAt: Timestamp.fromDate(now), // Using Firebase Timestamp instead of ISO string
      updatedTimestamp: serverTimestamp(), // Using Firebase server timestamp for consistent timestamp type
      lastEditTime: clientTimestamp,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

// Delete a message (only allowed for message owner, admin, or community author)
export const deleteCommunityMessage = async (messageId: string) => {
  try {
    await deleteDoc(doc(db, MESSAGE_COLLECTION, messageId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
