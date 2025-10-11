import { useState } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import type { ProjectDetailsViewModel } from "../../hooks/useProjectsManagement";

interface ForceUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, unlockMinutes: number) => Promise<void>;
  project: ProjectDetailsViewModel | null;
}

interface ForceUnlockFormData {
  reason: string;
  unlockMinutes: number;
}

const ForceUnlockModal = ({
  isOpen,
  onClose,
  onSubmit,
  project,
}: ForceUnlockModalProps) => {
  const [form] = Form.useForm<ForceUnlockFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      await onSubmit(values.reason, values.unlockMinutes);
      form.resetFields();
    } catch (error) {
      console.error("Validation or submission error:", error);
      // If it's not a validation error, show error message
      if (
        error &&
        typeof error === "object" &&
        "errorFields" in error === false
      ) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to unlock project";
        message.error(errorMessage);
      }
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
      title={`Force Unlock Project: ${project?.name || ""}`}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isSubmitting}
      okText="Unlock"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        name="forceUnlockProject"
        initialValues={{ unlockMinutes: 60 }}
      >
        <Form.Item
          name="reason"
          label="Reason"
          rules={[
            {
              required: true,
              message: "Please provide a reason for unlocking this project",
            },
            {
              min: 10,
              message: "Reason must be at least 10 characters",
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Explain why this project needs to be unlocked (this will be logged for audit purposes)"
          />
        </Form.Item>

        <Form.Item
          name="unlockMinutes"
          label="Unlock Duration (minutes)"
          rules={[
            {
              required: true,
              message: "Please specify unlock duration",
            },
            {
              type: "number",
              min: 1,
              message: "Duration must be at least 1 minute",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={1}
            max={1440}
            placeholder="60"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ForceUnlockModal;
