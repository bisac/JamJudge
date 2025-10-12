import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  Typography,
  Spin,
  Alert,
  Progress,
  Tag,
} from "antd";
import {
  TeamOutlined,
  ProjectOutlined,
  BarChartOutlined,
  RocketOutlined,
  SettingOutlined,
  UserSwitchOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useEventContext } from "../../hooks/useEventContext";
import { useTeamsManagement } from "../../hooks/useTeamsManagement";
import { useProjectsManagement } from "../../hooks/useProjectsManagement";
import { useScoresPreview } from "../../hooks/useScoresPreview";
import { useEventCriteria } from "../../hooks/useEventCriteria";

const { Title, Text, Paragraph } = Typography;

const OrganizerDashboard: React.FC = () => {
  const { event, currentStage, isLoading: eventLoading } = useEventContext();
  const { teams, isLoading: teamsLoading } = useTeamsManagement(
    event?.id || null,
  );
  const { projects, isLoading: projectsLoading } = useProjectsManagement(
    event?.id || null,
  );
  const { scores, isLoading: scoresLoading } = useScoresPreview(
    event?.id || null,
  );
  const { criteria, isLoading: criteriaLoading } = useEventCriteria(
    event?.id || null,
  );

  // Calculate statistics
  const totalTeams = teams.length;
  const totalMembers = useMemo(
    () => teams.reduce((sum, team) => sum + team.members.length, 0),
    [teams],
  );

  const totalProjects = projects.length;
  const submittedProjects = projects.filter(
    (p) => p.status === "submitted",
  ).length;
  const draftProjects = totalProjects - submittedProjects;

  const totalEvaluations = useMemo(
    () => scores.reduce((sum, score) => sum + score.evaluationsCount, 0),
    [scores],
  );

  const projectsWithEvaluations = scores.filter(
    (s) => s.evaluationsCount > 0,
  ).length;

  const evaluationProgress =
    totalProjects > 0 ? (projectsWithEvaluations / totalProjects) * 100 : 0;

  const totalCriteria = criteria.length;
  const totalWeight = useMemo(
    () => criteria.reduce((sum, c) => sum + c.weight, 0),
    [criteria],
  );

  // Determine stage status
  const stageInfo = useMemo(() => {
    switch (currentStage) {
      case "registration":
        return {
          title: "Registration",
          color: "blue" as const,
          description: "Participants are registering and forming teams",
        };
      case "work_in_progress":
        return {
          title: "Work in Progress",
          color: "cyan" as const,
          description: "Teams are working on their projects",
        };
      case "submission":
        return {
          title: "Submission Period",
          color: "orange" as const,
          description: "Teams are submitting their final projects",
        };
      case "rating":
        return {
          title: "Rating",
          color: "purple" as const,
          description: "Jury is evaluating submitted projects",
        };
      case "finished":
        return {
          title: "Finished",
          color: "green" as const,
          description: "Event has concluded",
        };
      default:
        return {
          title: "Unknown",
          color: "default" as const,
          description: "Event stage is not configured",
        };
    }
  }, [currentStage]);

  // Determine what actions are available
  const canPublish = currentStage === "finished" && !event?.resultsPublishedAt;
  const isPublished = !!event?.resultsPublishedAt;

  if (eventLoading || teamsLoading || projectsLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <Alert
        message="No Active Event"
        description="There is no active event configured. Please set up an event first."
        type="warning"
        showIcon
        action={
          <Link to="/organizer/event">
            <Button type="primary" icon={<SettingOutlined />}>
              Configure Event
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div>
          <Title level={2}>Organizer Dashboard</Title>
          <Paragraph type="secondary">
            Monitor and manage your event. Track team registrations, project
            submissions, and evaluation progress.
          </Paragraph>
        </div>

        {/* Event Status Card */}
        <Card
          title="Event Status"
          extra={<Tag color={stageInfo.color}>{stageInfo.title}</Tag>}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong>{event.name}</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">{stageInfo.description}</Text>
              </div>
            </div>

            {event.submissionDeadline && (
              <div>
                <Text type="secondary">Submission Deadline: </Text>
                <Text strong>
                  {new Date(event.submissionDeadline.toDate()).toLocaleString()}
                </Text>
              </div>
            )}

            {event.ratingEndAt && (
              <div>
                <Text type="secondary">Rating End: </Text>
                <Text strong>
                  {new Date(event.ratingEndAt.toDate()).toLocaleString()}
                </Text>
              </div>
            )}

            {isPublished && event.resultsPublishedAt && (
              <Alert
                message="Results Published"
                description={`Results were published on ${new Date(
                  event.resultsPublishedAt.toDate(),
                ).toLocaleString()}`}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            )}
          </Space>
        </Card>

        {/* Quick Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Teams"
                value={totalTeams}
                prefix={<TeamOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    / {totalMembers} members
                  </Text>
                }
                valueStyle={{ color: "#1890ff" }}
              />
              <Link to="/organizer/teams">
                <Button type="link" size="small" style={{ padding: 0 }}>
                  Manage Teams
                </Button>
              </Link>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Projects"
                value={totalProjects}
                prefix={<ProjectOutlined />}
                suffix={
                  <Space size="small" style={{ fontSize: "14px" }}>
                    <Tag color="green">{submittedProjects} submitted</Tag>
                    <Tag color="default">{draftProjects} draft</Tag>
                  </Space>
                }
                valueStyle={{ color: "#52c41a" }}
              />
              <Link to="/organizer/projects">
                <Button type="link" size="small" style={{ padding: 0 }}>
                  View Projects
                </Button>
              </Link>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Evaluations"
                value={totalEvaluations}
                prefix={<BarChartOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    / {projectsWithEvaluations} projects rated
                  </Text>
                }
                valueStyle={{ color: "#722ed1" }}
              />
              {!scoresLoading && (
                <Link to="/organizer/scores">
                  <Button type="link" size="small" style={{ padding: 0 }}>
                    Preview Scores
                  </Button>
                </Link>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Criteria"
                value={totalCriteria}
                prefix={<StarOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    / {totalWeight.toFixed(1)} total weight
                  </Text>
                }
                valueStyle={{ color: "#faad14" }}
              />
              {!criteriaLoading && (
                <Link to="/organizer/criteria">
                  <Button type="link" size="small" style={{ padding: 0 }}>
                    Configure Criteria
                  </Button>
                </Link>
              )}
            </Card>
          </Col>
        </Row>

        {/* Evaluation Progress (during rating stage) */}
        {currentStage === "rating" && totalProjects > 0 && (
          <Card title="Evaluation Progress">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Projects with Evaluations</Text>
                  <Text type="secondary">
                    {projectsWithEvaluations} of {totalProjects} projects
                  </Text>
                </div>
                <Progress
                  percent={evaluationProgress}
                  status={evaluationProgress === 100 ? "success" : "active"}
                  strokeColor={{
                    "0%": "#722ed1",
                    "100%": "#52c41a",
                  }}
                />
              </div>

              {evaluationProgress < 100 && (
                <Alert
                  message={`${totalProjects - projectsWithEvaluations} project${
                    totalProjects - projectsWithEvaluations !== 1 ? "s" : ""
                  } still waiting for evaluations.`}
                  type="info"
                  showIcon
                />
              )}

              {evaluationProgress === 100 && (
                <Alert
                  message="All Projects Have Been Evaluated!"
                  description="All submitted projects have received at least one evaluation. You can now proceed to publish results."
                  type="success"
                  showIcon
                />
              )}
            </Space>
          </Card>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Link to="/organizer/event">
                <Button
                  icon={<SettingOutlined />}
                  block
                  size="large"
                  style={{ height: "auto", padding: "16px" }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>Event Settings</div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      Configure event details and deadlines
                    </div>
                  </div>
                </Button>
              </Link>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Link to="/organizer/criteria">
                <Button
                  icon={<StarOutlined />}
                  block
                  size="large"
                  style={{ height: "auto", padding: "16px" }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>Criteria</div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      Manage evaluation criteria
                    </div>
                  </div>
                </Button>
              </Link>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Link to="/organizer/users">
                <Button
                  icon={<UserSwitchOutlined />}
                  block
                  size="large"
                  style={{ height: "auto", padding: "16px" }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>Users</div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      Manage user roles
                    </div>
                  </div>
                </Button>
              </Link>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Link to="/organizer/scores">
                <Button
                  icon={<BarChartOutlined />}
                  block
                  size="large"
                  style={{ height: "auto", padding: "16px" }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>Scores Preview</div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      Review evaluation results
                    </div>
                  </div>
                </Button>
              </Link>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Link to="/organizer/publish">
                <Button
                  type={canPublish ? "primary" : "default"}
                  icon={<RocketOutlined />}
                  block
                  size="large"
                  disabled={!canPublish && !isPublished}
                  style={{ height: "auto", padding: "16px" }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>
                      {isPublished ? "Results Published" : "Publish Results"}
                    </div>
                    <div style={{ fontSize: "12px", opacity: 0.7 }}>
                      {canPublish
                        ? "Ready to publish"
                        : isPublished
                          ? "View publication details"
                          : "Available after rating ends"}
                    </div>
                  </div>
                </Button>
              </Link>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Link to="/organizer/audits">
                <Button
                  icon={<BarChartOutlined />}
                  block
                  size="large"
                  style={{ height: "auto", padding: "16px" }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>Audit Log</div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      View administrative actions
                    </div>
                  </div>
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>

        {/* Configuration Warnings */}
        {totalCriteria === 0 && (
          <Alert
            message="No Criteria Defined"
            description="You haven't defined any evaluation criteria yet. Jury members won't be able to evaluate projects until criteria are configured."
            type="warning"
            showIcon
            action={
              <Link to="/organizer/criteria">
                <Button size="small" type="primary">
                  Add Criteria
                </Button>
              </Link>
            }
          />
        )}

        {totalCriteria > 0 && Math.abs(totalWeight - 1.0) > 0.01 && (
          <Alert
            message="Criteria Weights Don't Sum to 1.0"
            description={`Total weight is ${totalWeight.toFixed(2)}, but should be 1.0 for proper score calculation.`}
            type="warning"
            showIcon
            action={
              <Link to="/organizer/criteria">
                <Button size="small">Adjust Weights</Button>
              </Link>
            }
          />
        )}
      </Space>
    </div>
  );
};

export default OrganizerDashboard;
