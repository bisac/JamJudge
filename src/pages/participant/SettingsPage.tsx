import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Card,
  Space,
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuthContext } from "../../hooks/useAuthContext";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";

const ParticipantSettingsPage: React.FC = () => {
  const { user } = useAuthContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { displayName: string }) => {
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: values.displayName,
        updatedAt: Timestamp.now(),
      });
      message.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      message.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <Card title="Profile Settings">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Avatar size={80} icon={<UserOutlined />} src={user?.photoURL} />
            <div style={{ marginTop: 12 }}>
              <Upload disabled>
                <Button icon={<UploadOutlined />} disabled>
                  Change Photo (Coming Soon)
                </Button>
              </Upload>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              email: user?.email,
              displayName: user?.displayName,
            }}
            onFinish={onFinish}
          >
            <Form.Item label="Email">
              <Input disabled value={user?.email} />
            </Form.Item>

            <Form.Item
              label="Display Name"
              name="displayName"
              rules={[
                { required: true, message: "Display name is required" },
                {
                  min: 2,
                  message: "Display name must be at least 2 characters",
                },
              ]}
            >
              <Input placeholder="Enter your display name" />
            </Form.Item>

            <Form.Item label="Role">
              <Input disabled value="Participant" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default ParticipantSettingsPage;
