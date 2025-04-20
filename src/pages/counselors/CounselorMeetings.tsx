import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  getUserUpcomingBookings,
  cancelBooking,
} from "../../services/counselorService";
import { Link } from "react-router-dom";
import { Calendar, Clock, Globe, RefreshCw, X, User } from "lucide-react";

interface Meeting {
  counselorId: string;
  counselorName: string;
  counselorPhoto?: string;
  counselorSpecialization?: string;
  date: {
    toDate: () => Date;
  };
  time: string;
  status: string;
  meetLink?: string;
}

const CounselorMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMeetings();
  }, [user?.uid]);

  const fetchMeetings = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const bookings = await getUserUpcomingBookings(user.uid);
      setMeetings(bookings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Failed to load meeting data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const joinMeeting = (meetLink?: string) => {
    if (!meetLink) {
      toast.error("Meeting link is not available yet");
      return;
    }
    window.open(meetLink, "_blank");
  };

  const handleCancelBooking = async (meeting: Meeting) => {
    if (!user?.uid) return;

    // Format date as YYYY-MM-DD
    const dateObj = meeting.date.toDate();
    const dateStr = dateObj.toISOString().split("T")[0];
    const timeSlot = meeting.time;

    // Create a unique ID for tracking the cancellation process
    const cancelId = `${meeting.counselorId}-${dateStr}-${timeSlot}`;

    try {
      setProcessingAction(cancelId);
      const result = await cancelBooking(
        meeting.counselorId,
        dateStr,
        timeSlot,
        user.uid
      );

      if (result.success) {
        toast.success("Session cancelled successfully!");
        // Refresh meetings list
        fetchMeetings();
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Failed to cancel the session. Please try again.");
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Upcoming Sessions
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            View and manage your scheduled counseling sessions
          </p>
        </div>
        <button
          onClick={fetchMeetings}
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-lg text-center">
          <p>You don't have any upcoming meetings.</p>
          <Link
            to="/counselors"
            className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            Find a Counselor
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {meetings.map((meeting, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-neutral-700"
            >
              <div className="flex items-center mb-3">
                {meeting.counselorPhoto ? (
                  <img
                    src={meeting.counselorPhoto}
                    alt={meeting.counselorName}
                    className="w-12 h-12 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-neutral-600 mr-3 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {meeting.counselorName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold">
                    <Link
                      to={`/counselors/${meeting.counselorId}`}
                      className="hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {meeting.counselorName}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    {meeting.counselorSpecialization}
                  </p>
                </div>
              </div>

              <div className="mb-3 bg-gray-50 dark:bg-neutral-700 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">
                    {formatDate(meeting.date.toDate())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Time:</span>
                  <span className="text-sm">{meeting.time}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => joinMeeting(meeting.meetLink)}
                  disabled={!meeting.meetLink}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    meeting.meetLink
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Join Meeting
                </button>

                <button
                  onClick={() => handleCancelBooking(meeting)}
                  disabled={
                    processingAction ===
                    `${meeting.counselorId}-${
                      meeting.date.toDate().toISOString().split("T")[0]
                    }-${meeting.time}`
                  }
                  className="px-4 py-2 rounded-md flex items-center bg-error-50 text-error-700 hover:bg-error-100 dark:bg-error-900/20 dark:text-error-300 dark:hover:bg-error-900/30"
                >
                  {processingAction ===
                  `${meeting.counselorId}-${
                    meeting.date.toDate().toISOString().split("T")[0]
                  }-${meeting.time}` ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CounselorMeetings;
