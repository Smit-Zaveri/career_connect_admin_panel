// filepath: f:\hemant\project\src\services\counselorService.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  CollectionReference,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import {
  Counselor,
  CounselorFormData,
  CounselorStatus,
} from "../types/counselor";
import { v4 as uuidv4 } from "uuid";

// Firebase counselor type with Timestamp instead of Date
export interface FirebaseCounselor
  extends Omit<Counselor, "createdAt" | "updatedAt"> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  bookedSlots: any[]; // Assuming bookedSlots is an array of objects
}

// Define the BookingData type
export interface BookingData {
  id: string;
  date: string;
  time: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  duration: number;
  status: string;
  meetLink?: string;
}

// Convert Firestore data to Counselor type
export function convertFirebaseCounselor(
  doc: QueryDocumentSnapshot
): Counselor {
  const data = doc.data() as FirebaseCounselor;

  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

// Upload counselor profile image
async function uploadCounselorImage(file: File): Promise<string> {
  const fileExtension = file.name.split(".").pop();
  const fileName = `counselors/${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return url;
}

// Delete counselor profile image
async function deleteCounselorImage(photoURL: string): Promise<void> {
  if (!photoURL || !photoURL.includes("firebase")) return;

  try {
    const storageRef = ref(storage, photoURL);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

// Get all counselors with optional filters
export async function getCounselors(
  filters: { [key: string]: any } = {},
  pageSize = 10,
  lastDoc?: DocumentSnapshot | null
): Promise<{
  counselors: Counselor[];
  lastVisible: DocumentSnapshot | null;
}> {
  try {
    const counselorsRef = collection(db, "counselors");

    // Start with a basic query
    let q = query(counselorsRef);

    // Apply filters one by one to prevent composite index issues
    // Note: We can only use one inequality filter per query
    let hasInequality = false;

    // Apply equality filters first (these don't cause index issues)
    if (filters.status && filters.status !== "") {
      q = query(q, where("status", "==", filters.status));
    }

    if (filters.specialization && filters.specialization !== "") {
      q = query(q, where("specialization", "==", filters.specialization));
    }

    if (filters.isVerified !== undefined && filters.isVerified !== null) {
      q = query(q, where("isVerified", "==", filters.isVerified));
    }

    // Add ordering - always order by createdAt for consistency
    q = query(q, orderBy("createdAt", "desc"));

    // Apply pagination if lastDoc is provided
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    // Apply page size limit
    q = query(q, limit(pageSize));

    const snapshot = await getDocs(q);

    // Get the last visible document
    const lastVisible =
      snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    const counselors = snapshot.docs.map(convertFirebaseCounselor);

    return {
      counselors,
      lastVisible,
    };
  } catch (error) {
    console.error("Error getting counselors:", error);
    throw error;
  }
}

// Get counselor by ID
export async function getCounselorById(id: string): Promise<Counselor | null> {
  try {
    const counselorDoc = await getDoc(doc(db, "counselors", id));

    if (counselorDoc.exists()) {
      const data = counselorDoc.data() as FirebaseCounselor;

      return {
        ...data,
        id: counselorDoc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting counselor:", error);
    throw error;
  }
}

// Create a new counselor
export async function createCounselor(
  counselorData: CounselorFormData
): Promise<string> {
  try {
    const counselorRef = collection(db, "counselors");

    // Store the password securely
    // In a real application, we would hash the password here
    const counselorWithDefaults = {
      ...counselorData,
      rating: 0,
      sessionCount: 0,
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const result = await addDoc(counselorRef, counselorWithDefaults);
    return result.id;
  } catch (error) {
    console.error("Error creating counselor:", error);
    throw error;
  }
}

// Update an existing counselor
export async function updateCounselor(
  id: string,
  counselorData: CounselorFormData
): Promise<void> {
  try {
    const counselorRef = doc(db, "counselors", id);

    // Conditionally include password in the update data
    const updatedData = !counselorData.password
      ? {
          ...counselorData,
          updatedAt: serverTimestamp(),
          password: undefined, // TypeScript-safe way to exclude it from Firestore update
        }
      : {
          ...counselorData,
          updatedAt: serverTimestamp(),
        };

    await updateDoc(counselorRef, updatedData);
  } catch (error) {
    console.error("Error updating counselor:", error);
    throw error;
  }
}

// Delete a counselor
export async function deleteCounselor(id: string): Promise<void> {
  try {
    const counselorRef = doc(db, "counselors", id);
    const counselorSnapshot = await getDoc(counselorRef);

    if (!counselorSnapshot.exists()) {
      throw new Error("Counselor not found");
    }

    const counselorData = counselorSnapshot.data() as FirebaseCounselor;

    // Delete profile photo if exists
    if (counselorData.photoURL) {
      await deleteCounselorImage(counselorData.photoURL);
    }

    // Delete the counselor document
    await deleteDoc(counselorRef);

    // TODO: In a production app, you might want to cascade delete related records
    // (sessions, reviews, etc.)
  } catch (error) {
    console.error("Error deleting counselor:", error);
    throw error;
  }
}

// Update counselor status
export async function updateCounselorStatus(
  id: string,
  status: CounselorStatus
): Promise<void> {
  try {
    const counselorRef = doc(db, "counselors", id);

    await updateDoc(counselorRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating counselor status:", error);
    throw error;
  }
}

// Toggle verification status of a counselor
export async function toggleCounselorVerification(
  id: string,
  isVerified: boolean
): Promise<void> {
  try {
    const counselorRef = doc(db, "counselors", id);

    await updateDoc(counselorRef, {
      isVerified,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error toggling counselor verification:", error);
    throw error;
  }
}

// Search counselors by name or specialization
export async function searchCounselors(
  searchTerm: string,
  limitCount = 10
): Promise<Counselor[]> {
  try {
    // Firebase doesn't support full text search, so we'll fetch records and filter client-side
    // For a production app, consider using Algolia or similar service
    const counselorsRef = collection(db, "counselors");
    const q = query(
      counselorsRef,
      where("status", "==", "active"),
      orderBy("name"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    let counselors = snapshot.docs.map(convertFirebaseCounselor);

    // Client-side filtering based on search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      counselors = counselors.filter(
        (counselor) =>
          counselor.name.toLowerCase().includes(lowerSearchTerm) ||
          counselor.specialization.toLowerCase().includes(lowerSearchTerm) ||
          counselor.expertise.some((exp) =>
            exp.toLowerCase().includes(lowerSearchTerm)
          )
      );
    }

    return counselors.slice(0, limitCount);
  } catch (error) {
    console.error("Error searching counselors:", error);
    throw error;
  }
}

// Get available dates for a counselor
export async function getAvailableDates(counselorId: string): Promise<any[]> {
  try {
    const availableDatesRef = collection(
      db,
      "counselors",
      counselorId,
      "available_slots"
    );
    const q = query(availableDatesRef);
    const querySnapshot = await getDocs(q);

    const dates: any[] = [];
    querySnapshot.forEach((doc) => {
      dates.push({ id: doc.id, ...doc.data() });
    });

    // Sort dates by date field
    return dates.sort(
      (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
    );
  } catch (error) {
    console.error("Error getting available dates:", error);
    throw error;
  }
}

// Get available slots for a specific date
export async function getAvailableSlots(
  counselorId: string,
  dateStr: string
): Promise<any> {
  try {
    const slotRef = doc(
      db,
      "counselors",
      counselorId,
      "available_slots",
      dateStr
    );
    const docSnap = await getDoc(slotRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("No available slots found for the selected date");
    }
  } catch (error) {
    console.error("Error getting available slots:", error);
    throw error;
  }
}

// Book a slot
export async function bookSlot(
  counselorId: string,
  dateStr: string,
  timeSlot: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; meetLink: string }> {
  try {
    // Check if slot is available
    const slotRef = doc(
      db,
      "counselors",
      counselorId,
      "available_slots",
      dateStr
    );
    const slotDoc = await getDoc(slotRef);

    if (!slotDoc.exists()) {
      throw new Error("Date not found");
    }

    const slotData = slotDoc.data() as any;
    const slotIndex = slotData.slots.findIndex(
      (s: any) => s.time === timeSlot && !s.isBooked
    );

    if (slotIndex === -1) {
      throw new Error("This time slot is not available");
    }

    // Update slot to booked status
    const updatedSlots = [...slotData.slots];
    updatedSlots[slotIndex].isBooked = true;

    // Update available slots count
    const newAvailableSlots = slotData.availableSlots - 1;

    await updateDoc(slotRef, {
      slots: updatedSlots,
      availableSlots: newAvailableSlots,
    });

    // Generate a meet link (in a real app, integrate with Google Calendar API)
    const meetLink = `https://meet.google.com/${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Add to counselor's booked slots
    const counselorRef = doc(db, "counselors", counselorId);
    const counselorDoc = await getDoc(counselorRef);

    if (!counselorDoc.exists()) {
      throw new Error("Counselor not found");
    }

    const counselorData = counselorDoc.data() as any;
    const bookedSlots = counselorData.bookedSlots || [];

    // Create a date object from the date string (formatted as YYYY-MM-DD)
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);

    // Create a new booked slot
    const newBookedSlot = {
      date: Timestamp.fromDate(dateObj),
      time: timeSlot,
      userId: userId,
      userName: userName,
      status: "confirmed",
      meetLink: meetLink,
    };

    bookedSlots.push(newBookedSlot);

    // Update counselor with new booked slot and increment session count
    await updateDoc(counselorRef, {
      bookedSlots: bookedSlots,
      sessionCount: (counselorData.sessionCount || 0) + 1,
    });

    return { success: true, meetLink };
  } catch (error) {
    console.error("Error booking slot:", error);
    throw error;
  }
}

// Cancel a booking
export async function cancelBooking(
  counselorId: string,
  dateStr: string,
  timeSlot: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    // First, update the available_slots document
    const slotRef = doc(
      db,
      "counselors",
      counselorId,
      "available_slots",
      dateStr
    );

    const slotDoc = await getDoc(slotRef);
    if (!slotDoc.exists()) {
      throw new Error("Date not found");
    }

    const slotData = slotDoc.data() as any;
    const slotIndex = slotData.slots.findIndex((s: any) => s.time === timeSlot);

    if (slotIndex === -1) {
      throw new Error("Time slot not found");
    }

    // Mark the slot as not booked
    const updatedSlots = [...slotData.slots];
    updatedSlots[slotIndex].isBooked = false;

    // Update available slots count
    const newAvailableSlots = slotData.availableSlots + 1;

    await updateDoc(slotRef, {
      slots: updatedSlots,
      availableSlots: newAvailableSlots,
    });

    // Remove from counselor's booked slots
    const counselorRef = doc(db, "counselors", counselorId);
    const counselorDoc = await getDoc(counselorRef);

    if (!counselorDoc.exists()) {
      throw new Error("Counselor not found");
    }

    const counselorData = counselorDoc.data() as any;
    let bookedSlots = counselorData.bookedSlots || [];

    // Create a date object from the date string (formatted as YYYY-MM-DD)
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);

    // Filter out the booking to cancel
    bookedSlots = bookedSlots.filter(
      (slot: any) =>
        !(
          slot.time === timeSlot &&
          slot.userId === userId &&
          slot.date.toDate().toDateString() === dateObj.toDateString()
        )
    );

    // Update counselor with the updated booked slots
    await updateDoc(counselorRef, {
      bookedSlots: bookedSlots,
    });

    return { success: true };
  } catch (error) {
    console.error("Error canceling booking:", error);
    throw error;
  }
}

// Add available slots for a date
export async function addAvailableSlots(
  counselorId: string,
  dateStr: string,
  dayOfWeek: string,
  slots: string[]
): Promise<{ success: boolean }> {
  try {
    const slotRef = doc(
      db,
      "counselors",
      counselorId,
      "available_slots",
      dateStr
    );

    // Create a date object from the date string (formatted as YYYY-MM-DD)
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);

    // Create slots array with booked status
    const slotsData = slots.map((time) => ({
      time,
      isBooked: false,
    }));

    await updateDoc(slotRef, {
      date: Timestamp.fromDate(dateObj),
      formattedDate: dateStr,
      dayOfWeek: dayOfWeek.toLowerCase(),
      isAvailable: true,
      slots: slotsData,
      availableSlots: slots.length,
      totalSlots: slots.length,
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding available slots:", error);
    throw error;
  }
}

// Update counselor availability pattern
export async function updateAvailabilityPattern(
  counselorId: string,
  availability: any[]
): Promise<{ success: boolean }> {
  try {
    const counselorRef = doc(db, "counselors", counselorId);
    await updateDoc(counselorRef, {
      availability,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating availability pattern:", error);
    throw error;
  }
}

// Generate available slots for future dates based on counselor's availability pattern
export async function generateFutureSlotsFromPattern(
  counselorId: string,
  weeksAhead: number = 4
): Promise<{ success: boolean; results: any[] }> {
  try {
    // Get counselor data with availability pattern
    const counselorRef = doc(db, "counselors", counselorId);
    const counselorDoc = await getDoc(counselorRef);

    if (!counselorDoc.exists()) {
      throw new Error("Counselor not found");
    }

    const counselorData = counselorDoc.data() as any;
    const availabilityPattern = counselorData.availability || [];

    if (availabilityPattern.length === 0) {
      throw new Error("No availability pattern found");
    }

    // Calculate dates for the next few weeks
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + weeksAhead * 7);

    // Create a map for easier lookup of day patterns
    const dayPatterns = new Map();
    availabilityPattern.forEach((day: any) => {
      dayPatterns.set(day.day.toLowerCase(), day.slots);
    });

    // Loop through days and generate slots
    const currentDate = new Date();
    const batchResults = [];

    while (currentDate <= endDate) {
      // Get day of week (lowercase)
      const dayOfWeek = currentDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Check if this day has an availability pattern
      if (dayPatterns.has(dayOfWeek)) {
        const slots = dayPatterns.get(dayOfWeek);
        const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format

        try {
          // Check if document already exists to avoid overwriting
          const slotRef = doc(
            db,
            "counselors",
            counselorId,
            "available_slots",
            dateStr
          );

          const existingDoc = await getDoc(slotRef);

          // Only create if it doesn't exist
          if (!existingDoc.exists()) {
            // Add the slots for this date
            const result = await addAvailableSlots(
              counselorId,
              dateStr,
              dayOfWeek,
              slots
            );
            batchResults.push({ date: dateStr, result });
          }
        } catch (err) {
          console.error(`Error generating slots for ${dateStr}:`, err);
          batchResults.push({ date: dateStr, error: err });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { success: true, results: batchResults };
  } catch (error) {
    console.error("Error generating future slots:", error);
    throw error;
  }
}

// Get upcoming bookings for a user
export async function getUserUpcomingBookings(userId: string): Promise<any[]> {
  try {
    // Query all counselors to find bookings for this user
    const counselorsRef = collection(db, "counselors");
    const counselorsSnapshot = await getDocs(counselorsRef);

    const now = new Date();
    const bookings: any[] = [];

    // Process each counselor
    for (const counselorDoc of counselorsSnapshot.docs) {
      const counselor = counselorDoc.data();

      // Find bookings for this user
      if (counselor.bookedSlots && counselor.bookedSlots.length > 0) {
        const userBookings = counselor.bookedSlots
          .filter(
            (slot: any) => slot.userId === userId && slot.date.toDate() >= now
          )
          .map((slot: any) => ({
            ...slot,
            counselorId: counselorDoc.id,
            counselorName: counselor.name,
            counselorPhoto: counselor.photoURL,
            counselorSpecialization: counselor.specialization,
          }));

        bookings.push(...userBookings);
      }
    }

    // Sort by date/time
    return bookings.sort((a, b) => {
      // First compare date
      const dateCompare = a.date.toDate().getTime() - b.date.toDate().getTime();
      if (dateCompare !== 0) return dateCompare;

      // If same date, compare time
      return a.time.localeCompare(b.time);
    });
  } catch (error) {
    console.error("Error getting user bookings:", error);
    throw error;
  }
}

// Add a rating for a counselor after a session
export async function rateCounselor(
  counselorId: string,
  rating: number,
  feedback?: string
): Promise<{ success: boolean; newRating: number }> {
  try {
    // Get current counselor data
    const counselorRef = doc(db, "counselors", counselorId);
    const counselorDoc = await getDoc(counselorRef);

    if (!counselorDoc.exists()) {
      throw new Error("Counselor not found");
    }

    const counselorData = counselorDoc.data() as any;
    const currentRating = counselorData.rating || 0;
    const sessionCount = counselorData.sessionCount || 0;

    // Calculate new average rating
    let newRating: number;

    if (sessionCount === 0) {
      newRating = rating;
    } else {
      // Calculate weighted average
      newRating = (currentRating * sessionCount + rating) / (sessionCount + 1);
    }

    // Round to 1 decimal place
    newRating = Math.round(newRating * 10) / 10;

    // Update counselor document
    await updateDoc(counselorRef, {
      rating: newRating,
    });

    // Store the individual rating in a subcollection if needed
    if (feedback) {
      const ratingsRef = collection(counselorRef, "ratings");
      await addDoc(ratingsRef, {
        rating: rating,
        feedback: feedback,
        timestamp: serverTimestamp(),
      });
    }

    return { success: true, newRating };
  } catch (error) {
    console.error("Error rating counselor:", error);
    throw error;
  }
}

// Create a Google Meet link for a counseling session
export async function createMeetLink(
  counselorId: string,
  dateStr: string,
  timeSlot: string
): Promise<string> {
  try {
    // In a real application, this would integrate with Google Calendar API
    // For now, we'll generate a placeholder meet link
    const randomId = Math.random().toString(36).substring(2, 15);
    const meetLink = `https://meet.google.com/${randomId}`;

    // Optionally, you could store this link in Firestore for reference
    const slotRef = doc(
      db,
      "counselors",
      counselorId,
      "available_slots",
      dateStr
    );
    const slotDoc = await getDoc(slotRef);

    if (slotDoc.exists()) {
      const slotData = slotDoc.data() as any;
      const slotIndex = slotData.slots.findIndex(
        (s: any) => s.time === timeSlot
      );

      if (slotIndex !== -1) {
        const updatedSlots = [...slotData.slots];
        updatedSlots[slotIndex].meetLink = meetLink;

        await updateDoc(slotRef, {
          slots: updatedSlots,
        });
      }
    }

    return meetLink;
  } catch (error) {
    console.error("Error creating meet link:", error);
    throw error;
  }
}

// Get counselor schedule (availability pattern)
export async function getCounselorSchedule(
  counselorId: string
): Promise<any[]> {
  try {
    const counselorRef = doc(db, "counselors", counselorId);
    const counselorDoc = await getDoc(counselorRef);

    if (!counselorDoc.exists()) {
      throw new Error("Counselor not found");
    }

    const counselorData = counselorDoc.data() as FirebaseCounselor;
    return counselorData.availability || [];
  } catch (error) {
    console.error("Error getting counselor schedule:", error);
    throw error;
  }
}

// Get bookings for a specific date
export async function getBookingsForDate(
  counselorId: string,
  dateStr: string
): Promise<BookingData[]> {
  try {
    const counselorRef = doc(db, "counselors", counselorId);
    const counselorDoc = await getDoc(counselorRef);

    if (!counselorDoc.exists()) {
      throw new Error("Counselor not found");
    }

    const counselorData = counselorDoc.data() as FirebaseCounselor;
    const bookings: BookingData[] = [];

    // Parse the date string to a Date object for comparison
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dateTimestamp = date.getTime();

    // Filter bookings for the specified date
    if (counselorData.bookedSlots && counselorData.bookedSlots.length > 0) {
      for (const slot of counselorData.bookedSlots) {
        const slotDate = slot.date.toDate();

        // Compare dates (ignoring time)
        if (slotDate.setHours(0, 0, 0, 0) === dateTimestamp) {
          bookings.push({
            id: `${slot.userId}-${dateStr}-${slot.time}`,
            date: dateStr,
            time: slot.time,
            studentId: slot.userId,
            studentName: slot.userName,
            studentAvatar: undefined, // We could fetch this from the users collection if needed
            duration: 30, // Default duration, could be stored with the booking
            status: slot.status,
            meetLink: slot.meetLink,
          });
        }
      }
    }

    // Sort by time
    return bookings.sort((a, b) => a.time.localeCompare(b.time));
  } catch (error) {
    console.error("Error getting bookings for date:", error);
    throw error;
  }
}

// Update counselor availability for a specific day
export async function updateAvailability(
  counselorId: string,
  dayName: string,
  timeSlots: string[]
): Promise<{ success: boolean }> {
  try {
    const counselorRef = doc(db, "counselors", counselorId);
    const counselorDoc = await getDoc(counselorRef);

    if (!counselorDoc.exists()) {
      throw new Error("Counselor not found");
    }

    const counselorData = counselorDoc.data() as FirebaseCounselor;
    let availability = counselorData.availability || [];

    // Check if the day already exists in the availability array
    const dayIndex = availability.findIndex((day) => day.day === dayName);

    if (dayIndex !== -1) {
      // Update existing day
      availability[dayIndex].slots = timeSlots;
    } else {
      // Add new day
      availability.push({
        day: dayName,
        slots: timeSlots,
      });
    }

    // Update the counselor document
    await updateDoc(counselorRef, {
      availability,
      updatedAt: serverTimestamp(),
    });

    // Generate slots for future dates based on the new pattern
    const weeksAhead = 4; // Generate for the next 4 weeks
    await generateFutureSlotsFromPattern(counselorId, weeksAhead);

    return { success: true };
  } catch (error) {
    console.error("Error updating availability:", error);
    throw error;
  }
}
