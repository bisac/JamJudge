import React, { useState } from "react";
import { Row, Col, Radio, Typography, Space, Spin, Alert, Empty } from "antd";
import { useEventContext } from "../../hooks/useEventContext";
import { useJuryProjectsList } from "../../hooks/useJuryProjectsList";
import ProjectListCard from "./components/ProjectListCard";

const { Title } = Typography;

type FilterType = "all" | "pending" | "in_progress" | "complete";

const ProjectsToRatePage: React.FC = () => {
  const { event } = useEventContext();
  const { projects, isLoading, error } = useJuryProjectsList(event?.id || null);
  const [filter, setFilter] = useState<FilterType>("all");

  // Filter projects based on selected filter
  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.myEvaluationStatus === filter;
  });

  // Count projects by status for filter labels
  const statusCounts = {
    all: projects.length,
    pending: projects.filter((p) => p.myEvaluationStatus === "pending").length,
    in_progress: projects.filter((p) => p.myEvaluationStatus === "in_progress")
      .length,
    complete: projects.filter((p) => p.myEvaluationStatus === "complete")
      .length,
  };

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
        message="Error Loading Projects"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Page Header */}
        <div>
          <Title level={2}>Projects to Rate</Title>
          <Typography.Text type="secondary">
            Review and evaluate submitted projects for this event
          </Typography.Text>
        </div>

        {/* Filter */}
        <Radio.Group
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">All ({statusCounts.all})</Radio.Button>
          <Radio.Button value="pending">
            Not Rated ({statusCounts.pending})
          </Radio.Button>
          <Radio.Button value="in_progress">
            In Progress ({statusCounts.in_progress})
          </Radio.Button>
          <Radio.Button value="complete">
            Completed ({statusCounts.complete})
          </Radio.Button>
        </Radio.Group>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Empty
            description={
              filter === "all"
                ? "No projects submitted yet"
                : `No ${filter === "pending" ? "unrated" : filter} projects`
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProjects.map((project) => (
              <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
                <ProjectListCard project={project} />
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </div>
  );
};

export default ProjectsToRatePage;
