import { useState } from "react";
import { Modal, Form } from "antd";
import CriterionForm from "./CriterionForm";
import type { CriterionDTO } from "../../types";

interface CriterionFormValues {
  name: string;
  weight: number;
  scaleMin: number;
  scaleMax: number;
}

interface CriterionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CriterionFormValues) => Promise<void>;
  initialData?: CriterionDTO | null;
}

const CriterionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CriterionModalProps) => {
  const [form] = Form.useForm<CriterionFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CriterionFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error submitting criterion:", error);
      // Error notification is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={initialData ? "Edit Criterion" : "Add New Criterion"}
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={isSubmitting}
      okText={initialData ? "Save Changes" : "Add Criterion"}
      cancelText="Cancel"
      destroyOnClose
    >
      <CriterionForm
        form={form}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
};

export default CriterionModal;
