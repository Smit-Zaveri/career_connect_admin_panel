import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Star,
  Calendar,
  Users,
  GraduationCap,
  Briefcase,
  Check,
  Clock,
  Share2,
  Globe,
  Languages,
  Loader,
  AlertCircle,
  MessageSquare,
  BadgeCheck,
  X,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getCounselorById,
  getAvailableDates,
  getAvailableSlots,
  bookSlot,
  cancelBooking,
  FirebaseCounselor,
  AvailableDate,
  Slot,
} from "../../services/counselorService";
import { formatDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";

const CounselorDetails: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [counselor, setCounselor] = useState<FirebaseCounselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDateData, setSelectedDateData] = useState<AvailableDate | null>(null);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'schedule' | 'bookings'>('overview');

  useEffect(() => {
    const fetchCounselorData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const counselorData = await getCounselorById(id);
        setCounselor(counselorData);

        // Get available dates
        const dates = await getAvailableDates(id);
        setAvailableDates(dates);

        // Select first available date if any
        if (dates.length > 0) {
          const nextAvailableDate = dates.find(date => date.isAvailable && date.availableSlots > 0);
          if (nextAvailableDate) {
            setSelectedDate(nextAvailableDate.formattedDate);
            fetchDateSlots(nextAvailableDate.formattedDate);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching counselor details:", err);
        setError("Failed to load counselor details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCounselorData();
  }, [id]);

  const fetchDateSlots = async (dateStr: string) => {
    if (!id) return;

    try {
      const slotsData = await getAvailableSlots(id, dateStr);
      setSelectedDateData(slotsData);
    } catch (err) {
      console.error("Error fetching slots for date:", err);
      toast.error("Failed to load available slots for the selected date");
      setSelectedDateData(null);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    fetchDateSlots(dateStr);
    setBookingSlot(null);
  };

  const handleBookSlot = async () => {
    if (!id || !user || !selectedDate || !bookingSlot) {
      toast.error("Please select a date and time slot");
      return;
    }

    try {
      setIsBooking(true);
      const result = await bookSlot(id, selectedDate, bookingSlot, user.id, user.name);

      if (result.success) {
        toast.success("Session booked successfully!");

        // Refresh data to show the updated availability and bookings
        fetchDateSlots(selectedDate);

        // Automatically switch to the "Upcoming Sessions" tab to show the booking
        setSelectedTab('bookings');

        // Refetch counselor data to update upcoming bookings
        const counselorData = await getCounselorById(id);
        setCounselor(counselorData);

        // Show the meeting link
        toast.success(`Meet link: ${result.meetLink}`, { duration: 10000 });
      }
    } catch (err) {
      console.error("Error booking slot:", err);
      toast.error("Failed to book the slot. Please try again.");
    } finally {
      setIsBooking(false);
      setBookingSlot(null);
    }
  };

  const handleCancelBooking = async (bookingDateTime: {date: any, time: string}) => {
    if (!id || !user || !bookingDateTime) return;

    // Format date as YYYY-MM-DD
    const dateObj = bookingDateTime.date.toDate();
    const dateStr = dateObj.toISOString().split('T')[0];
    const timeSlot = bookingDateTime.time;

    // Create a unique ID for tracking the cancellation process
    const cancelId = `${dateStr}-${timeSlot}`;

    try {
      setIsCancelling(cancelId);
      const result = await cancelBooking(id, dateStr, timeSlot, user.id);

      if (result.success) {
        toast.success("Session cancelled successfully!");

        // Refetch counselor data to update upcoming bookings
        const counselorData = await getCounselorById(id);
        setCounselor(counselorData);

        // If we're on the same date as the cancelled booking, refresh the slots
        if (selectedDate === dateStr) {
          fetchDateSlots(dateStr);
        }
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Failed to cancel the session. Please try again.");
    } finally {
      setIsCancelling(null);
    }
  };

  const isSlotAvailable = (slot: Slot) => {
    return !slot.isBooked;
  };

  const upcomingBookings = counselor?.bookedSlots?.filter(slot =>
    new Date(slot.date.toDate()) >= new Date()
  ).sort((a, b) =>
    a.date.toDate().getTime() - b.date.toDate().getTime()
  ) || [];

  const isUserBooking = (booking: any) => {
    return booking.userId === user?.id;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-lg">Loading counselor details...</span>
      </div>
    );
  }

  if (error || !counselor) {
    return (
      <div className="rounded-lg bg-error-50 p-6 text-center dark:bg-error-900/30">
        <h2 className="text-xl font-semibold text-error-800 dark:text-error-200">
          {error || "Counselor not found"}
        </h2>
        <p className="mt-2 text-error-600 dark:text-error-300">
          Could not load the counselor details. Please try again later.
        </p>
        <Link
          to="/counselors"
          className="mt-4 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Counselors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center"
        >
          <Link
            to="/counselors"
            className="mr-4 rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {counselor.name}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {counselor.specialization}
            </p>
          </div>
        </motion.div>

        {isAdmin && (
          <motion.div
            className="mt-4 flex space-x-2 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to={`/counselors/edit/${id}`}
              className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
            <div className="mb-4 border-b border-neutral-200 pb-4 dark:border-neutral-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center">
                  <div className="mr-4 h-16 w-16 overflow-hidden rounded-full">
                    <img
                      src={counselor.photoURL}
                      alt={counselor.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {counselor.name}
                    </h2>
                    <div className="mt-1 flex items-center">
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                        <Briefcase className="mr-1 h-3 w-3" />
                        {counselor.specialization}
                      </span>
                      {counselor.rating > 0 && (
                        <span className="ml-2 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                          <Star className="mr-1 h-4 w-4 text-warning-500" />
                          {counselor.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center md:mt-0">
                  <button className="mr-2 rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300">
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6 flex space-x-6 overflow-x-auto">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`border-b-2 px-1 pb-4 text-sm font-medium ${
                  selectedTab === 'overview'
                    ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('schedule')}
                className={`border-b-2 px-1 pb-4 text-sm font-medium ${
                  selectedTab === 'schedule'
                    ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                Schedule Session
              </button>
              <button
                onClick={() => setSelectedTab('bookings')}
                className={`border-b-2 px-1 pb-4 text-sm font-medium ${
                  selectedTab === 'bookings'
                    ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                Upcoming Sessions
              </button>
            </div>

            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-medium text-neutral-900 dark:text-white">About</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">{counselor.about}</p>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-medium text-neutral-900 dark:text-white">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {counselor.expertise?.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-0.5 text-sm font-medium text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'schedule' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-medium text-neutral-900 dark:text-white">Select Date</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {availableDates.length > 0 ? (
                      availableDates.map((date) => (
                        <button
                          key={date.formattedDate}
                          onClick={() => handleDateSelect(date.formattedDate)}
                          disabled={!date.isAvailable || date.availableSlots === 0}
                          className={`rounded-md border p-3 text-center text-sm ${
                            selectedDate === date.formattedDate
                              ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-400"
                              : date.isAvailable && date.availableSlots > 0
                              ? "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
                              : "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-500"
                          }`}
                        >
                          <div className="font-medium">
                            {new Date(date.formattedDate).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="mt-1 text-xs">
                            {new Date(date.formattedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div
                            className={`mt-1 text-xs ${
                              date.availableSlots > 0
                                ? "text-success-600 dark:text-success-400"
                                : "text-error-500 dark:text-error-400"
                            }`}
                          >
                            {date.availableSlots} slots
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-neutral-500 dark:text-neutral-400">
                        No available dates found
                      </div>
                    )}
                  </div>
                </div>

                {selectedDate && selectedDateData && (
                  <div>
                    <h3 className="mb-3 text-lg font-medium text-neutral-900 dark:text-white">
                      Select Time Slot
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {selectedDateData.slots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => isSlotAvailable(slot) && setBookingSlot(slot.time)}
                          disabled={!isSlotAvailable(slot)}
                          className={`rounded-md border p-3 text-center text-sm ${
                            bookingSlot === slot.time
                              ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-400"
                              : isSlotAvailable(slot)
                              ? "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
                              : "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-500"
                          }`}
                        >
                          {slot.time}
                          {!isSlotAvailable(slot) && (
                            <div className="mt-1 text-xs text-error-500 dark:text-error-400">Booked</div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleBookSlot}
                        disabled={!bookingSlot || isBooking}
                        className="inline-flex w-full items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600 dark:focus:ring-offset-neutral-800"
                      >
                        {isBooking ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Session
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'bookings' && (
              <div className="space-y-4">
                <h3 className="mb-3 text-lg font-medium text-neutral-900 dark:text-white">
                  Upcoming Sessions
                </h3>

                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-md border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                      >
                        <div>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-primary-500 dark:text-primary-400" />
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {booking.date.toDate().toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                            <Clock className="mr-2 h-4 w-4" />
                            {booking.time}
                          </div>
                          {isUserBooking(booking) && (
                            <div className="mt-1 text-xs text-success-600 dark:text-success-400">
                              Your booking
                            </div>
                          )}
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                          {booking.meetLink && (
                            <a
                              href={booking.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center rounded-md bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30"
                            >
                              <Globe className="mr-1 h-4 w-4" />
                              Join Meet
                            </a>
                          )}

                          {isUserBooking(booking) && (
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              disabled={isCancelling === `${booking.date.toDate().toISOString().split('T')[0]}-${booking.time}`}
                              className="inline-flex items-center rounded-md bg-error-50 px-3 py-1 text-sm font-medium text-error-700 hover:bg-error-100 dark:bg-error-900/20 dark:text-error-300 dark:hover:bg-error-900/30"
                            >
                              {isCancelling === `${booking.date.toDate().toISOString().split('T')[0]}-${booking.time}` ? (
                                <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <X className="mr-1 h-4 w-4" />
                              )}
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 rounded-full bg-neutral-100 p-3 dark:bg-neutral-700">
                      <Calendar className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-neutral-900 dark:text-white">
                      No upcoming sessions
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {isAdmin ? "This counselor has no upcoming booked sessions" : "You haven't booked any sessions with this counselor yet"}
                    </p>
                    {!isAdmin && (
                      <button
                        onClick={() => setSelectedTab('schedule')}
                        className="mt-4 inline-flex items-center rounded-md bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30"
                      >
                        <Calendar className="mr-1 h-4 w-4" />
                        Schedule a Session
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Counselor Info</h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/20">
                  <Briefcase className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Experience</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {counselor.experience} years
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/20">
                  <Star className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Rating</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {counselor.rating > 0 ? (
                      <span className="flex items-center">
                        {counselor.rating.toFixed(1)}
                        <Star className="ml-1 h-3 w-3 text-warning-500" />
                      </span>
                    ) : (
                      "Not yet rated"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/20">
                  <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Total Sessions</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {counselor.sessionCount}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/20">
                  <Languages className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Languages</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {counselor.languages?.join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/20">
                  <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Availability</h4>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {counselor.availability && counselor.availability.length > 0 ? (
                      <ul className="mt-1">
                        {counselor.availability.map((avail, idx) => (
                          <li key={idx} className="mb-1">
                            <span className="capitalize">{avail.day}</span>:{" "}
                            {avail.slots?.join(", ") || "No slots available"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No regular availability set"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {upcomingBookings.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
              <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Next Session</h3>
              <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-primary-50 p-4 dark:border-neutral-700 dark:bg-primary-900/10">
                <div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-primary-500 dark:text-primary-400" />
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {upcomingBookings[0].date.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                    <Clock className="mr-2 h-4 w-4" />
                    {upcomingBookings[0].time}
                  </div>
                  {isUserBooking(upcomingBookings[0]) && (
                    <div className="mt-1 text-xs text-success-600 dark:text-success-400">
                      Your booking
                    </div>
                  )}
                </div>
                <div>
                  {upcomingBookings[0].meetLink && (
                    <a
                      href={upcomingBookings[0].meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md bg-primary-600 px-3 py-1 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                    >
                      <Globe className="mr-1 h-4 w-4" />
                      Join Meet
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CounselorDetails;