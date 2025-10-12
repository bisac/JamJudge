import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useEventContext } from "../../hooks/useEventContext";
import { useJuryProjectsList } from "../../hooks/useJuryProjectsList";

const { Title, Text, Paragraph } = Typography;

const JuryDashboard: React.FC = () => {
  const { event, currentStage } = useEventContext();
  const { projects, isLoading, error } = useJuryProjectsList(event?.id || null);

  // Calculate statistics
  const totalProjects = projects.length;
  const evaluatedProjects = projects.filter(
    (p) => p.myEvaluationStatus === "complete",
  ).length;
  const inProgressProjects = projects.filter(
    (p) => p.myEvaluationStatus === "in_progress",
  ).length;
  const pendingProjects = projects.filter(
    (p) => p.myEvaluationStatus === "pending",
  ).length;

  const progressPercent =
    totalProjects > 0 ? (evaluatedProjects / totalProjects) * 100 : 0;

  // Determine if rating is active
  const isRatingActive = currentStage === "rating";

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div>
          <Title level={2}>Jury Dashboard</Title>
          <Paragraph type="secondary">
            Welcome to your evaluation dashboard. Review your progress and
            continue rating submitted projects.
          </Paragraph>
        </div>

        {/* Status Alert */}
        {!isRatingActive && (
          <Alert
            message="Rating Period Not Active"
            description={
              currentStage === "finished"
                ? "The rating period has ended. You can view your evaluations but cannot make changes."
                : "The rating period has not started yet. You will be able to evaluate projects once the submission deadline passes."
            }
            type="info"
            showIcon
          />
        )}

        {totalProjects === 0 && isRatingActive && (
          <Alert
            message="No Projects Submitted"
            description="There are no projects submitted for evaluation yet. Please check back later."
            type="info"
            showIcon
          />
        )}

        {totalProjects > 0 && (
          <>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Projects"
                    value={totalProjects}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Evaluated"
                    value={evaluatedProjects}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="In Progress"
                    value={inProgressProjects}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Remaining"
                    value={pendingProjects}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#8c8c8c" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Progress Card */}
            <Card title="Evaluation Progress">
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text strong>Overall Progress</Text>
                    <Text type="secondary">
                      {evaluatedProjects} of {totalProjects} projects completed
                    </Text>
                  </div>
                  <Progress
                    percent={progressPercent}
                    status={progressPercent === 100 ? "success" : "active"}
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                  />
                </div>

                {progressPercent < 100 && isRatingActive && (
                  <Alert
                    message={`You have ${pendingProjects + inProgressProjects} project${
                      pendingProjects + inProgressProjects !== 1 ? "s" : ""
                    } left to evaluate.`}
                    type="info"
                    showIcon
                  />
                )}

                {progressPercent === 100 && (
                  <Alert
                    message="All Projects Evaluated!"
                    description="You have completed evaluations for all submitted projects. Thank you for your contribution!"
                    type="success"
                    showIcon
                  />
                )}
              </Space>
            </Card>

            {/* Quick Actions */}
            {isRatingActive && pendingProjects > 0 && (
              <Card title="Quick Actions">
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text>
                      You have <strong>{pendingProjects}</strong> project
                      {pendingProjects !== 1 ? "s" : ""} waiting for evaluation.
                    </Text>
                  </div>
                  <Link to="/jury/projects">
                    <Button
                      type="primary"
                      size="large"
                      icon={<RightOutlined />}
                      block
                    >
                      Start Evaluating Projects
                    </Button>
                  </Link>
                </Space>
              </Card>
            )}

            {/* Event Information */}
            {event && (
              <Card title="Event Information">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Event Name</Text>
                      <Text strong>{event.name}</Text>
                    </Space>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Current Stage</Text>
                      <Text strong style={{ textTransform: "capitalize" }}>
                        {currentStage.replace("_", " ")}
                      </Text>
                    </Space>
                  </Col>
                  {event.ratingEndAt && (
                    <Col xs={24} sm={12}>
                      <Space direction="vertical" size="small">
                        <Text type="secondary">Rating Deadline</Text>
                        <Text strong>
                          {new Date(
                            event.ratingEndAt.toDate(),
                          ).toLocaleString()}
                        </Text>
                      </Space>
                    </Col>
                  )}
                </Row>
              </Card>
            )}
          </>
        )}
      </Space>
    </div>
  );
};

export default JuryDashboard;
