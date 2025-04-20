import React, { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import {
  Plus,
  X,
  Upload,
  DollarSign,
  Building,
  MapPin,
  Globe,
  Calendar,
} from "lucide-react";
import {
  employmentTypes,
  jobCategories,
  experienceLevels,
} from "../../types/job";
import * as z from "zod";
import { dateOptions } from "../../utils/dateUtils";

// Create a proper Zod schema for job form validation
const jobFormSchema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  employer_name: z.string().min(1, "Employer name is required"),
  job_city: z.string().optional(),
  job_country: z.string().optional(),
  job_description: z.string().min(1, "Job description is required"),
  job_employment_type: z.string(),
  job_category_id: z.string(),
  job_experience_level: z.string(),
  job_is_remote: z.boolean().default(false),
  salary_min: z.number().nonnegative().default(0),
  salary_max: z.number().nonnegative().default(0),
  salary_currency: z.string(),
  qualifications: z.array(z.string()),
  responsibilities: z.array(z.string()),
  benefits: z.array(z.string()),
  expiry_date: z.date(),
  job_apply_link: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0)),
  job_google_link: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
  employer_logo: z.any().optional(), // Can't strongly type File objects with zod easily
  tags: z.array(z.string()),
  job_publisher: z.string().optional(),
  isPopular: z.boolean().optional().default(false),
});

// Create type from Zod schema
type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(
    (initialData?.employer_logo as string) || null
  );

  const defaultValues: Partial<JobFormData> = {
    job_title: "",
    employer_name: "",
    job_city: "",
    job_country: "",
    job_description: "",
    job_employment_type: "Full-time" as any,
    job_category_id: "tech" as any,
    job_experience_level: "Mid-Level" as any,
    job_is_remote: false,
    salary_min: 0,
    salary_max: 0,
    salary_currency: "USD",
    qualifications: [""],
    responsibilities: [""],
    benefits: [""],
    expiry_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    job_apply_link: "",
    job_google_link: "",
    tags: [""],
    job_publisher: "Website",
    ...initialData,
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<JobFormData>({
    defaultValues,
    resolver: zodResolver(jobFormSchema),
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setValue("employer_logo", acceptedFiles[0]);
        const preview = URL.createObjectURL(acceptedFiles[0]);
        setPreviewImage(preview);
      }
    },
    onDropRejected: () => {
      toast.error("Please upload an image file under 5MB");
    },
  });

  const handleFormSubmit = async (data: JobFormData) => {
    try {
      await onSubmit(data);
      toast.success("Job saved successfully");
    } catch (error) {
      toast.error("Failed to save job");
      console.error(error);
    }
  };

  const addListItem = (
    field: "qualifications" | "responsibilities" | "benefits" | "tags"
  ) => {
    const currentItems = watch(field) || [];
    setValue(field, [...currentItems, ""]);
  };

  const removeListItem = (
    field: "qualifications" | "responsibilities" | "benefits" | "tags",
    index: number
  ) => {
    const currentItems = watch(field) || [];
    setValue(
      field,
      currentItems.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Job Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                {...register("job_title")}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.job_title && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.job_title.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Company Name
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 sm:text-sm">
                <Building className="h-4 w-4" />
              </span>
              <input
                type="text"
                {...register("employer_name")}
                className="block w-full rounded-r-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="Company name"
              />
            </div>
            {errors.employer_name && (
              <p className="mt-1 text-sm text-error-600">
                {errors.employer_name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                City
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 sm:text-sm">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  {...register("job_city")}
                  className="block w-full rounded-r-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                  placeholder="e.g., San Francisco"
                />
              </div>
              {errors.job_city && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.job_city.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Country
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 sm:text-sm">
                  <Globe className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  {...register("job_country")}
                  className="block w-full rounded-r-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                  placeholder="e.g., United States"
                />
              </div>
              {errors.job_country && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.job_country.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remote"
              {...register("job_is_remote")}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700"
            />
            <label
              htmlFor="remote"
              className="text-sm text-neutral-700 dark:text-neutral-300"
            >
              This is a remote position
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Employment Type
              </label>
              <div className="mt-1">
                <select
                  {...register("job_employment_type")}
                  className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                >
                  {employmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {errors.job_employment_type && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.job_employment_type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category
              </label>
              <div className="mt-1">
                <select
                  {...register("job_category_id")}
                  className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                >
                  {jobCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {errors.job_category_id && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.job_category_id.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Experience Level
            </label>
            <div className="mt-1">
              <select
                {...register("job_experience_level")}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            {errors.job_experience_level && (
              <p className="mt-1 text-sm text-error-600">
                {errors.job_experience_level.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Min Salary
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 sm:text-sm">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  {...register("salary_min", { valueAsNumber: true })}
                  className="block w-full rounded-r-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                  placeholder="0"
                />
              </div>
              {errors.salary_min && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.salary_min.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Max Salary
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 sm:text-sm">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  {...register("salary_max", { valueAsNumber: true })}
                  className="block w-full rounded-r-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                  placeholder="0"
                />
              </div>
              {errors.salary_max && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.salary_max.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Currency
              </label>
              <div className="mt-1">
                <select
                  {...register("salary_currency")}
                  className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Application Deadline
            </label>
            <div className="mt-1 relative">
              <Controller
                control={control}
                name="expiry_date"
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm pl-3 pr-10 py-2"
                    placeholderText="Select deadline date"
                    showPopperArrow={false}
                    popperClassName="react-datepicker-popper"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: "offset",
                        options: {
                          offset: [0, 8],
                        },
                      },
                      {
                        name: "preventOverflow",
                        options: {
                          padding: 8,
                        },
                      },
                    ]}
                    calendarClassName="bg-white dark:bg-neutral-800 shadow-lg"
                  />
                )}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </div>
            </div>
            {errors.expiry_date && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                {errors.expiry_date.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Apply Link
            </label>
            <div className="mt-1">
              <input
                type="url"
                {...register("job_apply_link")}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="https://company.com/careers/job"
              />
            </div>
            {errors.job_apply_link && (
              <p className="mt-1 text-sm text-error-600">
                {errors.job_apply_link.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Google Job Link (Optional)
            </label>
            <div className="mt-1">
              <input
                type="url"
                {...register("job_google_link")}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="https://www.google.com/jobs?q=job"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Company Logo
            </label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center rounded-md border-2 border-dashed border-neutral-300 px-6 pb-6 pt-5 dark:border-neutral-700"
            >
              <div className="space-y-1 text-center">
                <input {...getInputProps()} />
                {previewImage ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="mb-4 h-20 w-20 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(null);
                        setValue("employer_logo", undefined);
                      }}
                      className="text-sm text-error-600 hover:text-error-500"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                    <p className="mt-1 text-sm text-neutral-500">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Job Description
            </label>
            <div className="mt-1">
              <textarea
                {...register("job_description")}
                rows={6}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="Describe the job role, requirements, and company culture..."
              ></textarea>
              {errors.job_description && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.job_description.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Qualifications
            </label>
            <div className="mt-1 space-y-2">
              {watch("qualifications")?.map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    {...register(`qualifications.${index}`)}
                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                    placeholder="Add a qualification"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("qualifications", index)}
                    className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("qualifications")}
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add qualification
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Responsibilities
            </label>
            <div className="mt-1 space-y-2">
              {watch("responsibilities")?.map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    {...register(`responsibilities.${index}`)}
                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                    placeholder="Add a responsibility"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("responsibilities", index)}
                    className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("responsibilities")}
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add responsibility
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Benefits (Optional)
            </label>
            <div className="mt-1 space-y-2">
              {watch("benefits")?.map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    {...register(`benefits.${index}`)}
                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                    placeholder="Add a benefit"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("benefits", index)}
                    className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("benefits")}
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add benefit
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Tags
            </label>
            <div className="mt-1 space-y-2">
              {watch("tags")?.map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    {...register(`tags.${index}`)}
                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("tags", index)}
                    className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("tags")}
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add tag
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Examples: tech, remote, entry-level, senior, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Job Publisher
            </label>
            <div className="mt-1">
              <input
                type="text"
                {...register("job_publisher")}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="e.g., LinkedIn, Indeed, Website"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-700">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPopular"
            {...register("isPopular")}
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700"
          />
          <label
            htmlFor="isPopular"
            className="text-sm text-neutral-700 dark:text-neutral-300"
          >
            Mark as popular job posting
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            {isLoading ? (
              <>
                <span className="mr-2">Saving...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              "Save Job"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default JobForm;
