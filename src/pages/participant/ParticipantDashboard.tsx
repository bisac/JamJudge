import React, { useMemo } from "react";
import { Card, Col, Row, Statistic, Space, Button, Alert } from "antd";
import { Link } from "react-router-dom";
import { useEventContext } from "../../hooks/useEventContext";
import { useParticipantTeam } from "../../hooks/useParticipantTeam";
import { useProjectData } from "../../hooks/useProjectData";

const ParticipantDashboard: React.FC = () => {
  const { event, currentStage, deadlines } = useEventContext();
  const { team, isLoading: teamLoading } = useParticipantTeam();
  const { project, isLoading: projectLoading } = useProjectData();

  const status = useMemo(() => {
    if (!event) return { title: "No active event", color: "default" as const };
    switch (currentStage) {
      case "registration":
        return { title: "Registration", color: "blue" as const };
      case "work_in_progress":
        return { title: "Work in Progress", color: "green" as const };
      case "submission":
        return { title: "Submission", color: "orange" as const };
      case "rating":
        return { title: "Rating", color: "purple" as const };
      case "finished":
        return { title: "Finished", color: "default" as const };
      default:
        return { title: "Unknown", color: "default" as const };
    }
  }, [event, currentStage]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {!event && <Alert type="warning" showIcon message="No active event" />}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Event Status">
            <Statistic title="Stage" value={status.title} />
            <div style={{ marginTop: 12 }}>
              <div>
                Submission deadline:{" "}
                {deadlines.submission
                  ? deadlines.submission.toDate().toLocaleString()
                  : "—"}
              </div>
              <div>
                Rating end:{" "}
                {deadlines.rating
                  ? deadlines.rating.toDate().toLocaleString()
                  : "—"}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Team">
            {teamLoading ? (
              <Statistic title="Status" value="Loading…" />
            ) : team ? (
              <>
                <Statistic title="Name" value={team.name} />
                <div style={{ marginTop: 12 }}>
                  <Link to="/participant/team">
                    <Button type="link">View team</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Statistic title="Status" value="No team" />
                <Link to="/participant/team">
                  <Button type="primary" style={{ marginTop: 12 }}>
                    Create Team
                  </Button>
                </Link>
              </>
            )}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Project">
            {projectLoading ? (
              <Statistic title="Status" value="Loading…" />
            ) : project ? (
              <>
                <Statistic title="Status" value={project.status} />
                <div style={{ marginTop: 12 }}>
                  <Link to="/participant/project">
                    <Button type="link">Edit project</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Statistic title="Status" value="No project" />
                <Link to="/participant/project">
                  <Button type="primary" style={{ marginTop: 12 }}>
                    Create Project
                  </Button>
                </Link>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default ParticipantDashboard;
