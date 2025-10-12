import { useState } from "react";
import {
  Typography,
  Space,
  Card,
  Button,
  Alert,
  Modal,
  Descriptions,
} from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { usePublish } from "../../hooks/usePublish";
import { useActiveEvent } from "../../hooks/useActiveEvent";
import useMediaQuery from "../../hooks/useMediaQuery";
import RepublishModal from "../../components/organizer/RepublishModal";

const { Title, Paragraph } = Typography;

const PublishPage = () => {
  const { event } = useActiveEvent();
  const { publish, republish, isPublishing, isRepublishing } = usePublish();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isRepublishModalOpen, setIsRepublishModalOpen] = useState(false);

  // Check if rating period has ended
  const canPublish = event?.ratingEndAt
    ? event.ratingEndAt.toDate() < new Date()
    : false;

  // Check if results have been published
  const hasPublished = event?.resultsPublishedAt !== null;

  const handlePublish = () => {
    if (!event) return;

    Modal.confirm({
      title: "Publish Results",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to publish the results? This will make the leaderboard publicly visible. This action cannot be undone, but you can republish if needed.",
      okText: "Yes, Publish",
      cancelText: "Cancel",
      onOk: async () => {
        await publish(event.id);
      },
    });
  };

  const handleRepublish = async (reason: string) => {
    if (!event) return;
    await republish(event.id, reason);
  };

  if (!event) {
    return (
      <div style={{ padding: isMobile ? "16px" : "24px" }}>
        <Alert
          message="No Active Event"
          description="Please select or create an event first."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "16px" : "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Title level={2} style={{ margin: 0 }}>
            Publish Results
          </Title>
        </Card>

        {/* Event Status Panel */}
        <Card title="Event Status">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Event Name">
              {event.name}
            </Descriptions.Item>
            <Descriptions.Item label="Rating End">
              {event.ratingEndAt
                ? event.ratingEndAt.toDate().toLocaleString()
                : "Not set"}
            </Descriptions.Item>
            <Descriptions.Item label="Publication Status">
              {hasPublished ? (
                <span>
                  <CheckCircleOutlined style={{ color: "green" }} /> Published
                  on{" "}
                  {event.resultsPublishedAt?.toDate().toLocaleString() ||
                    "Unknown"}
                </span>
              ) : (
                <span>
                  <ExclamationCircleOutlined style={{ color: "orange" }} /> Not
                  Published
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Can Publish">
              {canPublish ? (
                <span style={{ color: "green" }}>
                  <CheckCircleOutlined /> Yes, rating period has ended
                </span>
              ) : (
                <span style={{ color: "orange" }}>
                  <ExclamationCircleOutlined /> No, rating period has not ended
                  yet
                </span>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Actions Panel */}
        <Card title="Actions">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {!canPublish && (
              <Alert
                message="Cannot Publish Yet"
                description="Results can only be published after the rating period has ended. Please wait until the rating end date has passed."
                type="info"
                showIcon
              />
            )}

            {!hasPublished ? (
              <>
                <Paragraph>
                  Publishing results will calculate final scores for all
                  projects and make the leaderboard publicly visible. Make sure
                  all jury evaluations are complete before publishing.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={handlePublish}
                  disabled={!canPublish}
                  loading={isPublishing}
                  block={isMobile}
                >
                  Publish Results
                </Button>
              </>
            ) : (
              <>
                <Alert
                  message="Results Already Published"
                  description="The results have been published. If you need to update them (e.g., due to corrected evaluations), you can republish."
                  type="success"
                  showIcon
                />
                <Paragraph>
                  Republishing will recalculate all scores and update the public
                  leaderboard. You must provide a reason for audit purposes.
                </Paragraph>
                <Button
                  type="default"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => setIsRepublishModalOpen(true)}
                  loading={isRepublishing}
                  block={isMobile}
                >
                  Republish Results
                </Button>
              </>
            )}
          </Space>
        </Card>
      </Space>

      <RepublishModal
        isOpen={isRepublishModalOpen}
        onClose={() => setIsRepublishModalOpen(false)}
        onSubmit={handleRepublish}
        isLoading={isRepublishing}
      />
    </div>
  );
};

export default PublishPage;
