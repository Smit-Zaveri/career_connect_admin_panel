import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  Timestamp,
  GeoPoint,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import { User } from "../context/AuthContext";

const COMMUNITY_COLLECTION = "communities";

export interface CommunityFormData {
  id?: string;
  title: string;
  description: string;
  image?: File | string;
  category?: string;
  tags?: string[];
  status?: string;
  featured?: boolean;
  pinned?: boolean;
}

export interface FirebaseCommunity {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  localImage?: boolean;
  category?: string;
  tags?: string[];
  status: string;
  featured: boolean;
  pinned: boolean;
  likes: number;
  comments: number;
  views: number;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
  deletedAt?: Timestamp;
  deletedBy?: string;
  restoredAt?: Timestamp;
  isDeleted: boolean;
  members: string[];
  bannedMembers?: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}

// Convert Firestore document to Community object
export const convertFirebaseCommunity = (doc: any): FirebaseCommunity => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
  };
};

// Get all communities with optional filtering
export const getCommunities = async (
  filters?: any,
  pageSize = 10,
  lastDoc?: any
) => {
  try {
    let communitiesQuery = collection(db, COMMUNITY_COLLECTION);
    let constraints: any[] = [];

    if (filters) {
      // Filter by status if provided
      if (filters.status && filters.status !== "all") {
        constraints.push(where("status", "==", filters.status));
      }

      // Filter by category if provided
      if (filters.category && filters.category !== "all") {
        constraints.push(where("category", "==", filters.category));
      }

      // Filter by featured status
      if (filters.featured) {
        constraints.push(where("featured", "==", true));
      }

      // Only show non-deleted posts by default
      if (filters.showDeleted === undefined || !filters.showDeleted) {
        constraints.push(where("isDeleted", "==", false));
      }

      // Filter by tags if needed
      if (filters.tag) {
        constraints.push(where("tags", "array-contains", filters.tag));
      }
    } else {
      // Default to showing only non-deleted posts
      constraints.push(where("isDeleted", "==", false));
    }

    // Default sorting by creation date, descending
    constraints.push(orderBy("createdAt", "desc"));

    // Apply pagination if lastDoc exists
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Apply page size limit
    constraints.push(limit(pageSize));

    const q = query(communitiesQuery, ...constraints);
    const querySnapshot = await getDocs(q);

    const communities: FirebaseCommunity[] = [];
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    querySnapshot.forEach((doc) => {
      communities.push(convertFirebaseCommunity(doc));
    });

    return { communities, lastVisible };
  } catch (error) {
    console.error("Error getting communities:", error);
    throw error;
  }
};

// Get a single community by ID
export const getCommunityById = async (communityId: string) => {
  try {
    const docRef = doc(db, COMMUNITY_COLLECTION, communityId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      try {
        // Increment view count
        await updateDoc(docRef, {
          views: increment(1),
        }).catch((err) => console.warn("Failed to update view count:", err));
      } catch (viewError) {
        console.warn("Error updating view count:", viewError);
      }

      return convertFirebaseCommunity(docSnap);
    } else {
      throw new Error(`Community with ID ${communityId} not found`);
    }
  } catch (error) {
    console.error("Error getting community:", error);
    throw error;
  }
};

// Create new community
export const createCommunity = async (
  communityData: CommunityFormData,
  currentUser: User
) => {
  try {
    // Create a new doc reference with auto ID
    const newCommunityRef = doc(collection(db, COMMUNITY_COLLECTION));

    // Handle image upload if it's a File
    let imageUrl = communityData.image;
    let imageWidth = 0;
    let imageHeight = 0;
    let localImage = false;

    if (communityData.image instanceof File) {
      const file = communityData.image;
      const storageRef = ref(
        storage,
        `community-images/${newCommunityRef.id}/${file.name}`
      );
      const uploadResult = await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(uploadResult.ref);

      // Get image dimensions (in a real app, you might use an actual image processing library)
      localImage = true;

      // Create a temporary image element to get dimensions
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
      imageWidth = img.width;
      imageHeight = img.height;
    }

    // Prepare community data with Firestore specific types
    const firebaseCommunityData: any = {
      title: communityData.title,
      description: communityData.description,
      image: imageUrl || "",
      imageWidth: imageWidth || 0,
      imageHeight: imageHeight || 0,
      localImage: localImage,
      category: communityData.category || "",
      tags: communityData.tags || [],
      status: communityData.status || "draft",
      featured: communityData.featured || false,
      pinned: communityData.pinned || false,
      likes: 0,
      comments: 0,
      views: 0,
      createdAt: serverTimestamp(),
      createdBy: currentUser.id,
      isDeleted: false,
      members: [currentUser.id],
      bannedMembers: [],
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar || "https://i.pravatar.cc/150?img=1", // Default avatar
        role: currentUser.role,
      },
    };

    await setDoc(newCommunityRef, firebaseCommunityData);

    // Get the document again to include server-side timestamp
    const docSnapshot = await getDoc(newCommunityRef);
    return convertFirebaseCommunity(docSnapshot);
  } catch (error) {
    console.error("Error creating community:", error);
    throw error;
  }
};

// Update existing community
export const updateCommunity = async (
  communityId: string,
  communityData: Partial<CommunityFormData>,
  currentUser: User
) => {
  try {
    const communityRef = doc(db, COMMUNITY_COLLECTION, communityId);

    // Handle image upload if it's a File
    if (communityData.image instanceof File) {
      const file = communityData.image;
      const storageRef = ref(
        storage,
        `community-images/${communityId}/${file.name}`
      );

      // Delete old image if it exists
      const docSnap = await getDoc(communityRef);
      if (docSnap.exists() && docSnap.data().image) {
        try {
          const oldImageRef = ref(storage, docSnap.data().image);
          await deleteObject(oldImageRef).catch(() => {
            // Ignore errors if old image doesn't exist
          });
        } catch (error) {
          console.warn("Error deleting old image:", error);
        }
      }

      const uploadResult = await uploadBytes(storageRef, file);
      communityData.image = await getDownloadURL(uploadResult.ref);

      // Get image dimensions
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Add dimensions to update data
      await updateDoc(communityRef, {
        imageWidth: img.width,
        imageHeight: img.height,
        localImage: true,
      });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Map form fields to Firebase fields
    if (communityData.title !== undefined)
      updateData.title = communityData.title;
    if (communityData.description !== undefined)
      updateData.description = communityData.description;
    if (communityData.image && typeof communityData.image === "string")
      updateData.image = communityData.image;
    if (communityData.category !== undefined)
      updateData.category = communityData.category;
    if (communityData.tags !== undefined) updateData.tags = communityData.tags;
    if (communityData.status !== undefined)
      updateData.status = communityData.status;
    if (communityData.featured !== undefined)
      updateData.featured = communityData.featured;
    if (communityData.pinned !== undefined)
      updateData.pinned = communityData.pinned;

    await updateDoc(communityRef, updateData);

    // Get the updated community
    const updatedCommunity = await getDoc(communityRef);
    return convertFirebaseCommunity(updatedCommunity);
  } catch (error) {
    console.error("Error updating community:", error);
    throw error;
  }
};

// Soft delete a community
export const deleteCommunity = async (communityId: string, userId: string) => {
  try {
    const communityRef = doc(db, COMMUNITY_COLLECTION, communityId);

    await updateDoc(communityRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: userId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting community:", error);
    throw error;
  }
};

// Restore a deleted community
export const restoreCommunity = async (communityId: string) => {
  try {
    const communityRef = doc(db, COMMUNITY_COLLECTION, communityId);

    await updateDoc(communityRef, {
      isDeleted: false,
      restoredAt: serverTimestamp(),
      deletedAt: null,
      deletedBy: null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error restoring community:", error);
    throw error;
  }
};

// Hard delete (permanent deletion) - Use with caution!
export const permanentlyDeleteCommunity = async (communityId: string) => {
  try {
    await deleteDoc(doc(db, COMMUNITY_COLLECTION, communityId));

    // Also delete associated images
    try {
      const storageRef = ref(storage, `community-images/${communityId}`);
      await deleteObject(storageRef).catch(() => {
        // Ignore errors if the folder doesn't exist
      });
    } catch (error) {
      console.warn("Error deleting community images:", error);
    }

    return { success: true };
  } catch (error) {
    console.error("Error permanently deleting community:", error);
    throw error;
  }
};

// Like/unlike a community
export const toggleCommunityLike = async (
  communityId: string,
  isLiked: boolean
) => {
  try {
    const communityRef = doc(db, COMMUNITY_COLLECTION, communityId);

    await updateDoc(communityRef, {
      likes: increment(isLiked ? 1 : -1),
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling community like:", error);
    throw error;
  }
};

// Add/remove member from community
export const toggleCommunityMembership = async (
  communityId: string,
  userId: string,
  isJoining: boolean
) => {
  try {
    const communityRef = doc(db, COMMUNITY_COLLECTION, communityId);

    if (isJoining) {
      // Add user to members array if not already a member
      await updateDoc(communityRef, {
        members: arrayUnion(userId),
      });
    } else {
      // Remove user from members array
      await updateDoc(communityRef, {
        members: arrayRemove(userId),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error toggling community membership:", error);
    throw error;
  }
};

// Ban/unban a user from community
export const toggleCommunityBan = async (
  communityId: string,
  userId: string,
  isBanning: boolean
) => {
  try {
    const communityRef = doc(db, COMMUNITY_COLLECTION, communityId);

    if (isBanning) {
      // Ban user
      await updateDoc(communityRef, {
        bannedMembers: arrayUnion(userId),
        members: arrayRemove(userId), // Also remove from members if they were a member
      });
    } else {
      // Unban user
      await updateDoc(communityRef, {
        bannedMembers: arrayRemove(userId),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error toggling community ban:", error);
    throw error;
  }
};

// Search communities by query string
export const searchCommunities = async (query: string) => {
  try {
    const communityQuery = query.toLowerCase();
    const communitiesRef = collection(db, COMMUNITY_COLLECTION);
    const snapshot = await getDocs(communitiesRef);

    const communities: FirebaseCommunity[] = [];

    snapshot.forEach((doc) => {
      const community = convertFirebaseCommunity(doc);

      // Only include non-deleted communities
      if (
        !community.isDeleted &&
        (community.title.toLowerCase().includes(communityQuery) ||
          community.description.toLowerCase().includes(communityQuery) ||
          community.category?.toLowerCase().includes(communityQuery) ||
          (community.tags &&
            community.tags.some((tag) =>
              tag.toLowerCase().includes(communityQuery)
            )))
      ) {
        communities.push(community);
      }
    });

    // Sort by relevance - title matches first, then description
    communities.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(communityQuery);
      const bTitle = b.title.toLowerCase().includes(communityQuery);

      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });

    return communities;
  } catch (error) {
    console.error("Error searching communities:", error);
    throw error;
  }
};

export const communityService = {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  restoreCommunity,
  permanentlyDeleteCommunity,
  toggleCommunityLike,
  toggleCommunityMembership,
  toggleCommunityBan,
  searchCommunities,
};
