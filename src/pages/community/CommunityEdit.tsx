import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader, Eye } from "lucide-react";
import CommunityForm from "../../components/community/CommunityForm";
import { CommunityFormData } from "../../components/community/CommunityForm";
import { useAuth } from "../../context/AuthContext";
import {
  getCommunityById,
  updateCommunity,
  FirebaseCommunity,
} from "../../services/communityService";
import toast from "react-hot-toast";

const CommunityEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin, isCounselor, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [community, setCommunity] = useState<FirebaseCommunity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!id) {
        setError("Post ID not provided");
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        const communityData = await getCommunityById(id);
        setCommunity(communityData);
        setError(null);
      } catch (err) {
        console.error("Error fetching community details:", err);
        setError("Failed to load post details. Please try again later.");
        setCommunity(null);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCommunity();
  }, [id]);

  const handleSubmit = async (data: CommunityFormData) => {
    if (!id || !user) {
      setError("Post ID not provided or user not logged in");
      return;
    }

    setIsLoading(true);
    try {
      // Filter out empty values from tags and handle null image
      const cleanData = {
        ...data,
        tags: data.tags?.filter((t) => t.trim() !== "") || [],
        image: data.image || undefined, // Convert null to undefined
      };

      await updateCommunity(id, cleanData, user);
      toast.success("Post updated successfully");
      navigate("/community");
    } catch (err) {
      console.error("Error updating post:", err);
      toast.error("Failed to update post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check permissions - only admin or the author (if counselor) can edit
  const canEdit = isAdmin || (isCounselor && community?.author.id === user?.id);
  if (!canEdit) {
    navigate("/community");
    return null;
  }

  // Map Firebase community to form data
  const mapCommunityToFormData = (
    community: FirebaseCommunity
  ): CommunityFormData => {
    return {
      title: community.title,
      description: community.description,
      category: community.category || "",
      tags: community.tags || [],
      status: (community.status as "published" | "draft") || "draft",
      featured: community.featured || false,
      pinned: community.pinned || false,
      imageUrl: community.image,
    };
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-lg">Loading post data...</span>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="rounded-lg bg-error-50 p-6 text-center dark:bg-error-900/30">
        <h2 className="text-xl font-semibold text-error-800 dark:text-error-200">
          {error || "Post not found"}
        </h2>
        <p className="mt-2 text-error-600 dark:text-error-300">
          Could not load the post data. Please try again later.
        </p>
        <button
          onClick={() => navigate("/community")}
          className="mt-4 inline-block rounded-md bg-white px-4 py-2 font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          Back to Community
        </button>
      </div>
    );
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
              Edit Community Post
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Update your community post
            </p>
          </div>
        </motion.div>

        <div className="hidden md:block">
          <button
            onClick={() => navigate(`/community/${id}`)}
            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Post
          </button>
        </div>
      </div>

      <motion.div
        className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CommunityForm
          initialData={mapCommunityToFormData(community)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEdit={true}
        />
      </motion.div>
    </div>
  );
};

export default CommunityEdit;
