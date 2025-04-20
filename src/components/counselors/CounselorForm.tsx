import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  counselorFormSchema,
  CounselorFormData,
  specializations,
} from "../../types/counselor";
import { CalendarDays, Clock, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

interface CounselorFormProps {
  initialData?: Partial<CounselorFormData>;
  onSubmit: (data: CounselorFormData) => void;
  isSubmitting: boolean;
}

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

const expertiseOptions = [
  "Career Planning",
  "Resume Writing",
  "Cover Letter Writing",
  "LinkedIn Profile Optimization",
  "Job Search Strategy",
  "Interview Preparation",
  "Salary Negotiation",
  "Career Change",
  "Job Market Analysis",
  "Professional Networking",
  "Personal Branding",
  "Technical Skills Assessment",
  "Soft Skills Development",
  "Work-Life Balance",
  "Leadership Coaching",
  "Remote Work Strategies",
  "Freelancing Guidance",
  "Portfolio Development",
];

const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Hindi",
  "Portuguese",
  "Arabic",
  "Russian",
];

const CounselorForm: React.FC<CounselorFormProps> = ({
  initialData = {
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    about: "",
    experience: 0,
    expertise: [],
    languages: ["English"],
    status: "pending",
    photoURL: "",
    availability: [{ day: "Monday", slots: [] }],
  },
  onSubmit,
  isSubmitting,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    typeof initialData.photoURL === "string" ? initialData.photoURL : null
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CounselorFormData>({
    resolver: zodResolver(counselorFormSchema),
    defaultValues: initialData,
  });

  const availability = watch("availability");

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setValue("photoURL", file as any);

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addDay = () => {
    const currentDays = availability.map((item) => item.day);
    const availableDays = weekDays.filter((day) => !currentDays.includes(day));

    if (availableDays.length === 0) return;

    setValue("availability", [
      ...availability,
      { day: availableDays[0], slots: [] },
    ]);
  };

  const removeDay = (index: number) => {
    setValue(
      "availability",
      availability.filter((_, i) => i !== index)
    );
  };

  const toggleTimeSlot = (dayIndex: number, slot: string) => {
    const currentDay = availability[dayIndex];
    const currentSlots = currentDay.slots || [];

    const newSlots = currentSlots.includes(slot)
      ? currentSlots.filter((s) => s !== slot)
      : [...currentSlots, slot];

    const newAvailability = [...availability];
    newAvailability[dayIndex] = { ...currentDay, slots: newSlots };

    setValue("availability", newAvailability);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
          Basic Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Photo Upload */}
          <div className="col-span-2 flex items-center space-x-4">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-500">
                  No Photo
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
                Profile Photo
              </label>
              <input
                type="file"
                onChange={handlePhotoChange}
                accept="image/*"
                className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:hover:file:bg-neutral-600"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200"
            >
              Name *
            </label>
            <input
              id="name"
              {...register("name")}
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200"
            >
              Email *{" "}
              <span className="text-xs text-neutral-500">(Used for login)</span>
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200"
            >
              Password *{" "}
              <span className="text-xs text-neutral-500">
                (For counselor login)
              </span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200"
            >
              Phone
            </label>
            <input
              id="phone"
              {...register("phone")}
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label
              htmlFor="specialization"
              className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200"
            >
              Primary Specialization *
            </label>
            <select
              id="specialization"
              {...register("specialization")}
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="">Select a specialization</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            {errors.specialization && (
              <p className="mt-1 text-sm text-red-500">
                {errors.specialization.message}
              </p>
            )}
          </div>

          {/* Experience */}
          <div>
            <label
              htmlFor="experience"
              className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200"
            >
              Years of Experience *
            </label>
            <input
              id="experience"
              type="number"
              min="0"
              step="1"
              {...register("experience", { valueAsNumber: true })}
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            {errors.experience && (
              <p className="mt-1 text-sm text-red-500">
                {errors.experience.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200"
            >
              Status *
            </label>
            <select
              id="status"
              {...register("status")}
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* About */}
          <div className="col-span-2">
            <label
              htmlFor="about"
              className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200"
            >
              About *
            </label>
            <textarea
              id="about"
              rows={4}
              {...register("about")}
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            ></textarea>
            {errors.about && (
              <p className="mt-1 text-sm text-red-500">
                {errors.about.message}
              </p>
            )}
          </div>

          {/* Expertise */}
          <div className="col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
              Areas of Expertise *
            </label>
            <Controller
              name="expertise"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2 md:grid-cols-3">
                  {expertiseOptions.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`expertise-${option}`}
                        checked={field.value?.includes(option)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const currentValue = field.value || [];
                          field.onChange(
                            checked
                              ? [...currentValue, option]
                              : currentValue.filter((val) => val !== option)
                          );
                        }}
                        className="h-4 w-4 rounded border border-neutral-300 bg-white text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800"
                      />
                      <label
                        htmlFor={`expertise-${option}`}
                        className="ml-2 text-sm text-neutral-900 dark:text-neutral-200"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.expertise && (
              <p className="mt-1 text-sm text-red-500">
                {errors.expertise.message as string}
              </p>
            )}
          </div>

          {/* Languages */}
          <div className="col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
              Languages *
            </label>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2 md:grid-cols-4">
                  {languageOptions.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`language-${option}`}
                        checked={field.value?.includes(option)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const currentValue = field.value || [];
                          field.onChange(
                            checked
                              ? [...currentValue, option]
                              : currentValue.filter((val) => val !== option)
                          );
                        }}
                        className="h-4 w-4 rounded border border-neutral-300 bg-white text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800"
                      />
                      <label
                        htmlFor={`language-${option}`}
                        className="ml-2 text-sm text-neutral-900 dark:text-neutral-200"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.languages && (
              <p className="mt-1 text-sm text-red-500">
                {errors.languages.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Availability
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Set the days and times when the counselor is available for
              sessions
            </p>
          </div>
          <button
            type="button"
            onClick={addDay}
            className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={availability.length >= 7}
          >
            <Plus className="mr-1 inline-block h-4 w-4" />
            Add Day
          </button>
        </div>

        {errors.availability && (
          <p className="mb-4 text-sm text-red-500">
            {errors.availability.message as string}
          </p>
        )}

        {availability.map((day, dayIndex) => (
          <div
            key={dayIndex}
            className="mb-6 rounded-md border border-neutral-300 p-4 dark:border-neutral-700"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                  {day.day}
                </h3>
              </div>

              {availability.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDay(dayIndex)}
                  className="flex items-center text-sm text-red-500 hover:text-red-700"
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Remove
                </button>
              )}
            </div>

            <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
              Available Time Slots *
            </label>

            <div className="grid gap-2 md:grid-cols-5">
              {timeSlots.map((slot) => {
                const isActive = day.slots?.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleTimeSlot(dayIndex, slot)}
                    className={`flex items-center rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isActive
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    {slot}
                  </button>
                );
              })}
            </div>

            {errors.availability?.[dayIndex]?.slots && (
              <p className="mt-1 text-sm text-red-500">
                {errors.availability[dayIndex].slots?.message as string}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Counselor"}
        </button>
      </div>
    </form>
  );
};

export default CounselorForm;
