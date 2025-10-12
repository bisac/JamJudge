import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Descriptions,
  Divider,
  Button,
  Spin,
  Space,
  Typography,
  Result,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEventContext } from "../../hooks/useEventContext";
import { useProjectEvaluation } from "../../hooks/useProjectEvaluation";
import EvaluationForm from "./components/EvaluationForm";
import EvaluationPanel from "./components/EvaluationPanel";

const { Title } = Typography;

const ProjectEvaluationPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { event, currentStage } = useEventContext();

  const { project, criteria, evaluation, saveEvaluation, isLoading, error } =
    useProjectEvaluation(projectId || null, event?.id || null);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Error Loading Project"
        subTitle={error.message}
        extra={
          <Link to="/jury/projects">
            <Button type="primary">Back to Projects</Button>
          </Link>
        }
      />
    );
  }

  if (!project) {
    return (
      <Result
        status="404"
        title="Project Not Found"
        subTitle="The project you are looking for does not exist."
        extra={
          <Link to="/jury/projects">
            <Button type="primary">Back to Projects</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Back Button */}
        <div>
          <Link to="/jury/projects">
            <Button icon={<ArrowLeftOutlined />}>Back to Projects</Button>
          </Link>
        </div>

        {/* Project Information Card */}
        <Card>
          <Title level={2}>{project.name}</Title>
          <Divider />

          <Descriptions column={1} bordered>
            <Descriptions.Item label="Description">
              {project.description || "No description provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Repository URL">
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.repoUrl}
                </a>
              ) : (
                "Not provided"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Demo URL">
              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.demoUrl}
                </a>
              ) : (
                "Not provided"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {project.status}
            </Descriptions.Item>
            {project.submittedAt && (
              <Descriptions.Item label="Submitted At">
                {new Date(project.submittedAt.toDate()).toLocaleString()}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Evaluation Card with Panel */}
        <Card title="Your Evaluation">
          <EvaluationPanel event={event} currentStage={currentStage}>
            <EvaluationForm
              criteria={criteria}
              initialEvaluation={evaluation}
              onSave={saveEvaluation}
            />
          </EvaluationPanel>
        </Card>
      </Space>
    </div>
  );
};

export default ProjectEvaluationPage;
