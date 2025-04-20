import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Plus,
  Check,
  X,
  Video,
  MoreHorizontal,
  Trash,
  Edit,
  CheckCheck,
  Save,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getCounselorSchedule,
  updateAvailability,
  getBookingsForDate,
  createMeetLink,
  cancelBooking,
  BookingData,
  AvailabilityDay,
} from "../../services/counselorService";
import toast from "react-hot-toast";

// Format date as YYYY-MM-DD
const formatDateStr = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Get day name from date
const getDayName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
};

const CounselorBookings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<AvailabilityDay[]>(
    []
  );
  const [dayBookings, setDayBookings] = useState<BookingData[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  // Load initial data
  useEffect(() => {
    const loadScheduleData = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const schedule = await getCounselorSchedule(user.id);
          setAvailabilityData(schedule);

          // Load bookings for the selected date
          await loadBookingsForDate(selectedDate);

          // Set initial available time slots for the selected date
          const dayName = getDayName(selectedDate);
          const dayData = schedule.find((day) => day.day === dayName);
          setAvailableTimeSlots(dayData?.slots || []);
          setSelectedTimeSlots(dayData?.slots || []);
        } catch (err) {
          console.error("Error loading counselor schedule:", err);
          toast.error("Failed to load schedule data");
        } finally {
          setLoading(false);
        }
      }
    };

    loadScheduleData();
  }, [user?.id]);

  const loadBookingsForDate = async (date: Date) => {
    if (!user?.id) return;

    try {
      const bookings = await getBookingsForDate(user.id, formatDateStr(date));
      setDayBookings(bookings);
    } catch (err) {
      console.error("Error loading bookings:", err);
      toast.error("Failed to load bookings for the selected date");
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);

    // Load bookings for the selected date
    await loadBookingsForDate(date);

    // Update available time slots based on the day of week
    const dayName = getDayName(date);
    const dayData = availabilityData.find((day) => day.day === dayName);
    setAvailableTimeSlots(dayData?.slots || []);
    setSelectedTimeSlots(dayData?.slots || []);

    setEditingAvailability(false);
  };

  const renderCalendar = () => {
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dateFormat = {
      month: "long",
      year: "numeric",
    } as Intl.DateTimeFormatOptions;
    const rows = [];
    let days = [];
    let day = new Date(startDate);

    // Calendar header
    rows.push(
      <div
        className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
        key="header"
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
    );

    // Calendar days
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dayStr = formatDateStr(day);
        const isToday = dayStr === formatDateStr(new Date());
        const isSelected = dayStr === formatDateStr(selectedDate);
        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

        // Check if the day has bookings
        const dayName = getDayName(day);
        const dayData = availabilityData.find((d) => d.day === dayName);
        const hasAvailability = dayData?.slots && dayData.slots.length > 0;

        days.push(
          <button
            key={dayStr}
            onClick={() => handleDateSelect(cloneDay)}
            className={`
              rounded-md py-2 px-1 text-center text-sm
              ${
                isSelected
                  ? "bg-primary-600 text-white dark:bg-primary-700"
                  : isToday
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  : isCurrentMonth
                  ? "bg-white text-neutral-900 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                  : "bg-neutral-50 text-neutral-400 dark:bg-neutral-900/50 dark:text-neutral-500"
              }
              ${!isCurrentMonth ? "opacity-50" : ""}
              ${hasAvailability ? "border-l-4 border-success-500" : ""}
            `}
          >
            <div className="text-center">{day.getDate()}</div>
            {hasAvailability && (
              <div className="mt-1 text-xs">{dayData?.slots.length} slots</div>
            )}
          </button>
        );
        day.setDate(day.getDate() + 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          </button>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {currentMonth.toLocaleDateString("en-US", dateFormat)}
          </h2>
          <button
            onClick={handleNextMonth}
            className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <ChevronRight className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>
        <div className="space-y-1">{rows}</div>
      </div>
    );
  };

  const toggleTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(timeSlot)) {
        return prev.filter((slot) => slot !== timeSlot);
      } else {
        return [...prev, timeSlot].sort();
      }
    });
  };

  const handleUpdateAvailability = async () => {
    if (!user?.id) return;

    const dayName = getDayName(selectedDate);

    try {
      setUpdateLoading(true);
      await updateAvailability(user.id, dayName, selectedTimeSlots);

      // Update local state
      setAvailabilityData((prev) =>
        prev.map((day) =>
          day.day === dayName ? { ...day, slots: [...selectedTimeSlots] } : day
        )
      );
      setAvailableTimeSlots(selectedTimeSlots);

      setEditingAvailability(false);
      toast.success("Availability updated successfully");
    } catch (err) {
      console.error("Error updating availability:", err);
      toast.error("Failed to update availability");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCreateMeetLink = async (bookingId: string) => {
    try {
      setProcessingAction(bookingId);
      const meetLink = await createMeetLink(bookingId);

      // Update local state
      setDayBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, meetLink } : booking
        )
      );

      toast.success("Meeting link created successfully");
    } catch (err) {
      console.error("Error creating meet link:", err);
      toast.error("Failed to create meeting link");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setProcessingAction(bookingId);
      await cancelBooking(bookingId);

      // Update local state
      setDayBookings((prev) =>
        prev.filter((booking) => booking.id !== bookingId)
      );

      toast.success("Booking cancelled successfully");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Failed to cancel booking");
    } finally {
      setProcessingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
        <span className="ml-2 text-lg">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col justify-between md:flex-row md:items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Manage Schedule
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Set your availability and manage bookings
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <motion.div
          className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Calendar
          </h2>
          {renderCalendar()}
        </motion.div>

        {/* Selected day schedule */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
              <div>
                {editingAvailability ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTimeSlots(availableTimeSlots);
                        setEditingAvailability(false);
                      }}
                      className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      <X className="mr-1.5 h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateAvailability}
                      disabled={updateLoading}
                      className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 dark:bg-primary-700 dark:hover:bg-primary-600"
                    >
                      {updateLoading ? (
                        <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-1.5 h-4 w-4" />
                      )}
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingAvailability(true)}
                    className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    <Edit className="mr-1.5 h-4 w-4" />
                    Edit Availability
                  </button>
                )}
              </div>
            </div>

            {/* Time slots section */}
            <div className="mb-8">
              <h3 className="mb-3 text-base font-medium text-neutral-900 dark:text-white">
                {editingAvailability
                  ? "Set Available Time Slots"
                  : "Available Time Slots"}
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {timeSlots.map((time) => {
                  const isAvailable = editingAvailability
                    ? selectedTimeSlots.includes(time)
                    : availableTimeSlots.includes(time);

                  // Check if slot is booked
                  const isBooked = dayBookings.some(
                    (booking) => booking.time === time
                  );

                  return (
                    <button
                      key={time}
                      onClick={() =>
                        editingAvailability && !isBooked && toggleTimeSlot(time)
                      }
                      disabled={!editingAvailability || isBooked}
                      className={`
                        flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium
                        ${
                          isBooked
                            ? "border-warning-300 bg-warning-50 text-warning-800 dark:border-warning-600 dark:bg-warning-900/20 dark:text-warning-300"
                            : isAvailable
                            ? "border-success-300 bg-success-50 text-success-800 dark:border-success-600 dark:bg-success-900/20 dark:text-success-300"
                            : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        }
                        ${
                          editingAvailability && !isBooked
                            ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700"
                            : ""
                        }
                      `}
                    >
                      {time}
                      {isBooked && !editingAvailability && (
                        <span className="ml-1.5 text-xs">(Booked)</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {editingAvailability && (
                <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  Click on time slots to toggle availability. Booked slots
                  cannot be modified.
                </div>
              )}
            </div>

            {/* Bookings for the day */}
            <div>
              <h3 className="mb-3 text-base font-medium text-neutral-900 dark:text-white">
                Bookings ({dayBookings.length})
              </h3>

              {dayBookings.length > 0 ? (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {dayBookings.map((booking) => (
                    <div key={booking.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                        <div className="mb-3 flex items-center sm:mb-0">
                          <div className="mr-4 h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                            {booking.studentAvatar ? (
                              <img
                                src={booking.studentAvatar}
                                alt={booking.studentName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-600 dark:text-neutral-400">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">
                              {booking.studentName}
                            </h4>
                            <div className="mt-1 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                              <Clock className="mr-1 h-4 w-4" />
                              {booking.time} ({booking.duration || 30} min)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Meeting link button */}
                          {booking.meetLink ? (
                            <a
                              href={booking.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                            >
                              <Video className="mr-1.5 h-4 w-4" />
                              Join Meet
                            </a>
                          ) : (
                            <button
                              onClick={() => handleCreateMeetLink(booking.id)}
                              disabled={processingAction === booking.id}
                              className="inline-flex items-center rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/40"
                            >
                              {processingAction === booking.id ? (
                                <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                              ) : (
                                <LinkIcon className="mr-1.5 h-4 w-4" />
                              )}
                              Create Link
                            </button>
                          )}

                          {/* Cancel button */}
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={processingAction === booking.id}
                            className="inline-flex items-center rounded-md border border-error-300 bg-white px-3 py-2 text-sm font-medium text-error-700 hover:bg-error-50 dark:border-error-600 dark:bg-transparent dark:text-error-400 dark:hover:bg-error-900/20"
                          >
                            {processingAction === booking.id ? (
                              <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                              <X className="mr-1.5 h-4 w-4" />
                            )}
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 py-6 text-center dark:border-neutral-700">
                  <div className="mb-3 rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
                    <Calendar className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                    No bookings for this day
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    There are no appointments scheduled for this day
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CounselorBookings;
