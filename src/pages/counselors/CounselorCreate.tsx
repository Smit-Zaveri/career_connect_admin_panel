import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CounselorForm from "../../components/counselors/CounselorForm";
import { CounselorFormData } from "../../types/counselor";
import { createCounselor } from "../../services/counselorService";
import toast from "react-hot-toast";
import Breadcrumb from "../../components/layout/Breadcrumb";

const CounselorCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CounselorFormData) => {
    try {
      setIsSubmitting(true);
      await createCounselor(data);
      toast.success("Counselor created successfully");
      navigate("/counselors");
    } catch (error) {
      console.error("Error creating counselor:", error);
      toast.error("Failed to create counselor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Counselors", href: "/counselors" },
          { label: "Create Counselor", href: "/counselors/create" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Create Counselor
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Add a new career counselor to the platform.
          </p>
        </div>
        <button
          onClick={() => navigate("/counselors")}
          className="flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to List
        </button>
      </div>

      <CounselorForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CounselorCreate;
