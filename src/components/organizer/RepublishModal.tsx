import { useState } from "react";
import { Modal, Form, Input, Alert } from "antd";

interface RepublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const RepublishModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: RepublishModalProps) => {
  const [form] = Form.useForm();
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLocalLoading(true);
      await onSubmit(values.reason);
      form.resetFields();
      onClose();
    } catch (err) {
      console.error("Validation or submission error:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Republish Results"
      open={isOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={localLoading || isLoading}
      okText="Republish"
      cancelText="Cancel"
      destroyOnClose
    >
      <Alert
        message="Warning"
        description="Republishing will recalculate and update all published results. This action will be logged for audit purposes."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          label="Reason"
          name="reason"
          rules={[
            {
              required: true,
              message: "Please provide a reason for republishing",
            },
            {
              min: 10,
              message: "Reason must be at least 10 characters long",
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="E.g., Corrected evaluation errors, Updated criteria weights, etc."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RepublishModal;
