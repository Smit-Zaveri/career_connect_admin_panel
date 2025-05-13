import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../context/AuthContext";
import {
  X,
  Loader,
  Upload,
  Tag as TagIcon,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export interface CommunityFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: "published" | "draft";
  featured: boolean;
  image?: File | null;
  imageUrl?: string;
  pinned?: boolean;
}

interface CommunityFormProps {
  initialData?: Partial<CommunityFormData>;
  onSubmit: (data: CommunityFormData) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
  categories?: string[]; // Predefined categories if available
}

const CommunityForm: React.FC<CommunityFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading,
  isEdit = false,
  categories = [
    "Career Advice",
    "Networking",
    "Well-being",
    "Technology",
    "Resume",
    "Soft Skills",
  ],
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CommunityFormData>({
    title: initialData.title || "",
    description: initialData.description || "",
    category: initialData.category || "",
    tags: initialData.tags || [],
    status: initialData.status || "draft",
    featured: initialData.featured || false,
    imageUrl: initialData.imageUrl || "",
    pinned: initialData.pinned || false,
    image: null,
  });

  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData.imageUrl || null
  );
  const [imageInputType, setImageInputType] = useState<"upload" | "link">(
    initialData.imageUrl ? "link" : "upload"
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();

      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag],
        });
      }

      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Check file type
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Sanitize file name to prevent issues
      const fileNameSanitized = selectedFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        ""
      );
      if (fileNameSanitized !== selectedFile.name) {
        console.log(
          `Sanitized filename from ${selectedFile.name} to ${fileNameSanitized}`
        );
      }

      setFormData({
        ...formData,
        image: selectedFile,
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      console.log(
        "Image selected for upload:",
        selectedFile.name,
        "Size:",
        (selectedFile.size / 1024).toFixed(2),
        "KB"
      );
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imageUrl: "",
    });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      // The image handling is now done in the communityService
      // We just pass along the form data and let the service handle the upload
      await onSubmit(formData);

      // Form submission is handled by the parent component (CommunityCreate or CommunityEdit)
      // which will handle navigation after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6 md:col-span-1">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <TagIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </div>
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="block w-full rounded-md border border-neutral-300 pl-10 pr-12 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="Add tags and press Enter"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Press Enter
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-5">
              <div className="flex items-center">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300"
                >
                  Featured post
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="pinned"
                  name="pinned"
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
                />
                <label
                  htmlFor="pinned"
                  className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300"
                >
                  Pin to top
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:col-span-1">
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Post Image
            </label>

            <div className="mb-2 flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setImageInputType("upload");
                  // Clear image URL if we switch to upload
                  if (imageInputType === "link") {
                    setFormData({ ...formData, imageUrl: "" });
                    setImagePreview(null);
                  }
                }}
                className={`relative inline-flex items-center rounded-l-md px-4 py-2 text-sm font-medium ${
                  imageInputType === "upload"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageInputType("link");
                  // Clear file upload if we switch to link
                  if (imageInputType === "upload") {
                    setFormData({ ...formData, image: null });
                    if (!formData.imageUrl) {
                      setImagePreview(null);
                    }
                  }
                }}
                className={`relative inline-flex items-center rounded-r-md px-4 py-2 text-sm font-medium ${
                  imageInputType === "link"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                URL
              </button>
            </div>

            {imageInputType === "link" ? (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl || ""}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({ ...formData, imageUrl: url });
                      // Update the preview with the URL
                      setImagePreview(url || null);
                    }}
                    placeholder="Enter image URL (https://...)"
                    className="block w-full rounded-md border border-neutral-300 pl-3 pr-12 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-2 space-y-2 rounded-md border border-neutral-300 p-2 dark:border-neutral-700">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Preview:
                    </p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-40 w-auto rounded-md object-cover"
                      onError={() => {
                        toast.error(
                          "Invalid image URL or image not accessible"
                        );
                        setImagePreview(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="inline-flex items-center rounded-md border border-transparent bg-error-100 px-3 py-1 text-xs font-medium text-error-700 hover:bg-error-200 dark:bg-error-900/20 dark:text-error-400 dark:hover:bg-error-900/30"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-neutral-300 px-6 py-4 dark:border-neutral-700">
                <div className="space-y-4 text-center">
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-40 w-auto rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="inline-flex items-center rounded-md border border-transparent bg-error-100 px-3 py-1 text-xs font-medium text-error-700 hover:bg-error-200 dark:bg-error-900/20 dark:text-error-400 dark:hover:bg-error-900/30"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                      <div className="flex flex-col space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500 dark:bg-neutral-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <span>Upload an image</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                        </label>
                        <p>or drag and drop (PNG, JPG)</p>
                        <p className="text-xs">Max file size: 5MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={10}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              placeholder="Enter post description"
              required
            ></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate("/community")}
          className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-75 dark:bg-primary-700 dark:hover:bg-primary-600"
        >
          {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Community" : "Create Community"}
        </button>
      </div>
    </form>
  );
};

export default CommunityForm;
