import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import CounselorForm from "../../components/counselors/CounselorForm";
import {
  getCounselorById,
  updateCounselor,
} from "../../services/counselorService";

const CounselorEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [counselor, setCounselor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchCounselor = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getCounselorById(id);
        setCounselor(data);
      } catch (error) {
        console.error("Error fetching counselor:", error);
        toast.error("Failed to load counselor details");
      } finally {
        setLoading(false);
      }
    };

    fetchCounselor();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      await updateCounselor(id, formData);
      toast.success("Counselor updated successfully");
      navigate("/counselors");
    } catch (error) {
      console.error("Error updating counselor:", error);
      toast.error("Failed to update counselor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Counselor not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Counselor</h1>
      <CounselorForm
        initialData={counselor}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CounselorEdit;
