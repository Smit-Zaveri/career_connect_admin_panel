import React, { useState, useRef, ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Book,
  Award,
  Save,
  Loader,
  Upload,
  X,
  Camera,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface ProfileSocialLinks {
  website: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
  github: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  position: string;
  company: string;
  education: string;
  skills: string[];
  experience: string;
  socialLinks: ProfileSocialLinks;
  dateOfBirth: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [skillInput, setSkillInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
    position: "",
    company: "",
    education: "",
    skills: [],
    experience: "",
    socialLinks: {
      website: "",
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      github: "",
    },
    dateOfBirth: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveProfile = async () => {
    setSaving(true);

    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, we would save the profile data to Firebase or another backend
      // For now, just show a success message
      toast.success("Profile updated successfully");

      // Update the user's name in the auth context
      // This would be done in the actual saveProfile function
      // updateUser({...user, name: `${formData.firstName} ${formData.lastName}`});
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Your Profile
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage your personal information and preferences
        </p>
      </motion.div>

      {/* Profile form container */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Avatar and personal info */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-col space-y-6">
            {/* Profile photo upload */}
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
              <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
                Profile Photo
              </h2>
              <div className="flex flex-col items-center">
                <div className="group relative mb-4">
                  <div
                    className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700"
                    onClick={handleAvatarClick}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-16 w-16 text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  {avatar && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -right-2 -top-2 rounded-full bg-error-500 p-1 text-white shadow-sm hover:bg-error-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </button>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  JPG, PNG or GIF, max 5MB
                </p>
              </div>
            </div>

            {/* Social links */}
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
              <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
                Social Links
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="website"
                    className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    <LinkIcon className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={formData.socialLinks.website}
                    onChange={handleSocialLinkChange}
                    placeholder="https://yourwebsite.com"
                    className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="linkedin"
                    className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    <Linkedin className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    id="linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleSocialLinkChange}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="twitter"
                    className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    <Twitter className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    id="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleSocialLinkChange}
                    placeholder="https://twitter.com/username"
                    className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="github"
                    className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    <Github className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="github"
                    id="github"
                    value={formData.socialLinks.github}
                    onChange={handleSocialLinkChange}
                    placeholder="https://github.com/username"
                    className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Middle and right columns - form fields */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
            <h2 className="mb-6 text-lg font-medium text-neutral-900 dark:text-white">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Mail className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  className="mt-1 block w-full rounded-md border border-neutral-300 bg-neutral-50 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-600 dark:text-neutral-400 sm:text-sm"
                />
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Email address cannot be changed. Contact support for
                  assistance.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Phone className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Calendar className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <MapPin className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Position */}
              <div>
                <label
                  htmlFor="position"
                  className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Briefcase className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  id="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineer"
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. Acme Inc."
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Education */}
              <div className="md:col-span-2">
                <label
                  htmlFor="education"
                  className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Book className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  id="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="e.g. Bachelor's in Computer Science, University Name"
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Skills */}
              <div className="md:col-span-2">
                <label
                  htmlFor="skills"
                  className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Award className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />{" "}
                  Skills
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    id="skillInput"
                    value={skillInput}
                    onChange={handleSkillInputChange}
                    onKeyDown={handleSkillKeyPress}
                    placeholder="Add a skill and press Enter"
                    className="block w-full rounded-l-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="inline-flex items-center rounded-r-md border border-l-0 border-neutral-300 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-500"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 inline-flex items-center rounded-full p-0.5 text-primary-700 hover:bg-primary-100 hover:text-primary-800 dark:text-primary-300 dark:hover:bg-primary-900/30 dark:hover:text-primary-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio / About */}
              <div className="md:col-span-2">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Bio / About
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Write a short bio about yourself..."
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Experience */}
              <div className="md:col-span-2">
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Work Experience
                </label>
                <textarea
                  name="experience"
                  id="experience"
                  rows={4}
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="Describe your work experience..."
                  className="mt-1 block w-full rounded-md border border-neutral-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
              >
                {saving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
