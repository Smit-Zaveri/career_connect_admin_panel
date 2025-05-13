import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import CommunityForm from "../../components/community/CommunityForm";
import { CommunityFormData } from "../../components/community/CommunityForm";
import { useAuth } from "../../context/AuthContext";
import { createCommunity } from "../../services/communityService";
import toast from "react-hot-toast";

const CommunityCreate: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isCounselor, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CommunityFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a post");
      return;
    }

    try {
      setIsLoading(true);

      // Log the form data for debugging
      console.log("Submitting community post data:", {
        ...data,
        imageUrl: data.imageUrl || "No image URL",
      });

      // Clean up tags and ensure image is properly handled
      const cleanData = {
        ...data,
        tags: data.tags?.filter((t) => t.trim() !== "") || [],
      };

      // Create community in Firebase
      const result = await createCommunity(cleanData, user);
      console.log("Community created successfully with ID:", result.id);

      if (result.image) {
        console.log("Image URL for the new post:", result.image);
      }

      toast.success("Community post created successfully");

      // Redirect to community listing page
      navigate("/community");
    } catch (error) {
      console.error("Error creating community post:", error);
      toast.error("Failed to create community post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Restrict to admin and counselor users
  if (!isAdmin && !isCounselor) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center"
        >
          <button
            onClick={() => navigate("/community")}
            className="mr-4 rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Create Community Post
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Share information, resources or ask questions
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CommunityForm onSubmit={handleSubmit} isLoading={isLoading} />
      </motion.div>
    </div>
  );
};

export default CommunityCreate;
