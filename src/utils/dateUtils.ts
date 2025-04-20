import { Timestamp } from "firebase/firestore";

// Standard date formatting options
export const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

// Date with time formatting options
export const dateTimeOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

// Time only formatting options
export const timeOptions: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

// Full date formatting options with timezone
export const fullDateTimeOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "shortOffset",
};

/**
 * Formats a date or timestamp to a standard date string (April 18, 2025)
 */
export const formatDate = (
  date: Date | Timestamp | string | null | undefined
): string => {
  if (!date) return "N/A";

  try {
    let dateObj: Date;

    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      return "N/A";
    }

    return dateObj.toLocaleDateString("en-US", dateOptions);
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid date";
  }
};

/**
 * Formats a date or timestamp to include time (April 18, 2025 at 06:30 PM)
 */
export const formatDateTime = (
  date: Date | Timestamp | string | null | undefined
): string => {
  if (!date) return "N/A";

  try {
    let dateObj: Date;

    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      return "N/A";
    }

    return dateObj.toLocaleDateString("en-US", dateTimeOptions);
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid date";
  }
};

/**
 * Formats a date or timestamp to show only time (06:30 PM)
 */
export const formatTime = (
  date: Date | Timestamp | string | null | undefined
): string => {
  if (!date) return "N/A";

  try {
    let dateObj: Date;

    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      return "N/A";
    }

    return dateObj.toLocaleTimeString("en-US", timeOptions);
  } catch (e) {
    console.error("Error formatting time:", e);
    return "Invalid time";
  }
};

/**
 * Formats a date or timestamp to a full format with timezone (April 18, 2025 at 06:30:45 PM UTC+5:30)
 */
export const formatFullDateTime = (
  date: Date | Timestamp | string | null | undefined
): string => {
  if (!date) return "N/A";

  try {
    let dateObj: Date;

    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      return "N/A";
    }

    return dateObj.toLocaleString("en-US", fullDateTimeOptions);
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid date";
  }
};

/**
 * Returns a relative time string like "2 minutes ago", "yesterday", etc.
 */
export const getRelativeTimeString = (
  date: Date | Timestamp | string | null | undefined
): string => {
  if (!date) return "N/A";

  try {
    let dateObj: Date;

    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      return "N/A";
    }

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 172800) {
      return "yesterday";
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return formatDate(dateObj);
    }
  } catch (e) {
    console.error("Error calculating relative time:", e);
    return "Unknown time";
  }
};
