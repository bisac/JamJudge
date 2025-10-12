import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Result,
  Typography,
  Space,
  message,
  Alert,
} from "antd";
import { useParticipantTeam } from "../../hooks/useParticipantTeam";
import { useEventContext } from "../../hooks/useEventContext";

const { Title, Paragraph } = Typography;

const TeamPage: React.FC = () => {
  const { event } = useEventContext();
  const { team, isLoading, error, createTeam } = useParticipantTeam();
  const [form] = Form.useForm<{ name: string; description?: string }>();

  if (isLoading) {
    return <Result status="info" title="Loading team..." />;
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Failed to load team"
        subTitle={error.message}
      />
    );
  }

  if (!event) {
    return (
      <Result
        status="warning"
        title="No active event"
        subTitle="Team creation is available only within an active event."
      />
    );
  }

  if (team) {
    return (
      <Card>
        <Space direction="vertical" size="small">
          <Title level={4} style={{ margin: 0 }}>
            {team.name}
          </Title>
          {team.description && (
            <Paragraph style={{ marginBottom: 0 }}>
              {team.description}
            </Paragraph>
          )}
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Team created for event: {event.name}
          </Paragraph>
        </Space>
      </Card>
    );
  }

  return (
    <Card title="Create Team" style={{ maxWidth: 640 }}>
      <Alert
        type="info"
        showIcon
        message="Don’t have a team yet?"
        description="You can create a new team below, or ask an organizer to add you to an existing team."
        style={{ marginBottom: 16 }}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          try {
            await createTeam(values);
            message.success("Team created");
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Failed to create team";
            message.error(msg);
          }
        }}
      >
        <Form.Item
          label="Team Name"
          name="name"
          rules={[
            { required: true, message: "Please enter team name" },
            { max: 80 },
          ]}
        >
          <Input placeholder="e.g. Pixel Pioneers" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ max: 2000 }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Short description of your team"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Team
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TeamPage;
