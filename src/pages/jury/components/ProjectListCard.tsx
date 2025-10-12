import React from "react";
import { Card, Tag, Typography, Space } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ProjectListItemViewModel } from "../../../hooks/useJuryProjectsList";

const { Text } = Typography;

interface ProjectListCardProps {
  project: ProjectListItemViewModel;
}

const ProjectListCard: React.FC<ProjectListCardProps> = ({ project }) => {
  const navigate = useNavigate();

  // Status configuration
  const statusConfig = {
    complete: {
      color: "success",
      icon: <CheckCircleOutlined />,
      text: "Evaluated",
    },
    in_progress: {
      color: "processing",
      icon: <ClockCircleOutlined />,
      text: "In Progress",
    },
    pending: {
      color: "default",
      icon: <MinusCircleOutlined />,
      text: "Not Rated",
    },
  };

  const currentStatus = statusConfig[project.myEvaluationStatus];

  const handleClick = () => {
    navigate(`/jury/projects/${project.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{ height: "100%" }}
      styles={{
        body: { padding: "16px" },
      }}
    >
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        {/* Project Name */}
        <Typography.Title level={5} style={{ margin: 0 }}>
          {project.name}
        </Typography.Title>

        {/* Team Name */}
        <Text type="secondary">
          <strong>Team:</strong> {project.teamName}
        </Text>

        {/* Evaluation Status */}
        <Tag
          color={currentStatus.color}
          icon={currentStatus.icon}
          style={{ marginTop: "8px" }}
        >
          {currentStatus.text}
        </Tag>

        {/* Submission Date */}
        {project.submittedAt && (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Submitted:{" "}
            {new Date(project.submittedAt.toDate()).toLocaleDateString()}
          </Text>
        )}
      </Space>
    </Card>
  );
};

export default ProjectListCard;
