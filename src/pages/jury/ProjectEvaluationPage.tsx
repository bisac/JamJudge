import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Descriptions,
  Divider,
  Form,
  InputNumber,
  Input,
  Button,
  message,
  Spin,
  Alert,
  Space,
  Typography,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEventContext } from "../../hooks/useEventContext";
import type {
  ProjectDTO,
  CriterionDTO,
  ProjectEvaluationDTO,
} from "../../types";

const { Title } = Typography;
const { TextArea } = Input;

const ProjectEvaluationPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthContext();
  const { event, currentStage } = useEventContext();
  const [form] = Form.useForm();

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [criteria, setCriteria] = useState<CriterionDTO[]>([]);
  const [evaluation, setEvaluation] = useState<ProjectEvaluationDTO | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check if rating is allowed
  const isRatingAllowed = currentStage === "rating";

  useEffect(() => {
    if (!projectId || !event || !user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load project
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() } as ProjectDTO);
        }

        // Load criteria (placeholder - not used yet)
        setCriteria([]);

        // Load existing evaluation
        const evaluationDoc = await getDoc(
          doc(db, "projects", projectId, "evaluations", user.uid),
        );
        if (evaluationDoc.exists()) {
          setEvaluation({
            id: evaluationDoc.id,
            ...evaluationDoc.data(),
          } as ProjectEvaluationDTO);
        }
      } catch (error) {
        console.error("Error loading project data:", error);
        message.error("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, event, user]);

  interface EvaluationFormValues {
    scores?: Record<string, number>;
    feedback?: string;
  }

  const onFinish = async (values: EvaluationFormValues) => {
    if (!projectId || !user || !event) return;

    setSaving(true);
    try {
      const evaluationData = {
        jurorId: user.uid,
        scores: values.scores || {},
        feedback: values.feedback || null,
        totalWeighted: 0, // Will be calculated on publish
        updatedAt: Timestamp.now(),
        createdAt: evaluation?.createdAt || Timestamp.now(),
      };

      await setDoc(
        doc(db, "projects", projectId, "evaluations", user.uid),
        evaluationData,
      );

      message.success("Evaluation saved successfully");
      setEvaluation({
        id: user.uid,
        ...evaluationData,
      } as ProjectEvaluationDTO);
    } catch (error) {
      console.error("Error saving evaluation:", error);
      message.error("Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <Alert
        message="Project Not Found"
        description="The project you are looking for does not exist."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Link to="/jury/projects">
            <Button icon={<ArrowLeftOutlined />}>Back to Projects</Button>
          </Link>
        </div>

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

        <Card title="Your Evaluation">
          {!isRatingAllowed && (
            <Alert
              message="Rating Period Ended"
              description="The rating period has ended. You can no longer submit or modify evaluations."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              scores: evaluation?.scores || {},
              feedback: evaluation?.feedback || "",
            }}
            disabled={!isRatingAllowed}
          >
            {criteria.length > 0 ? (
              criteria.map((criterion) => (
                <Form.Item
                  key={criterion.id}
                  label={`${criterion.name} (Weight: ${criterion.weight})`}
                  name={["scores", criterion.id]}
                  rules={[
                    {
                      required: true,
                      message: `Please rate ${criterion.name}`,
                    },
                  ]}
                >
                  <InputNumber
                    min={criterion.scaleMin || 0}
                    max={criterion.scaleMax || 10}
                    step={0.1}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              ))
            ) : (
              <Alert
                message="No Criteria Defined"
                description="The organizer has not yet defined evaluation criteria for this event. Please check back later."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item label="Feedback" name="feedback">
              <TextArea
                rows={6}
                placeholder="Provide your feedback for this project (optional)"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                disabled={!isRatingAllowed}
                icon={<SaveOutlined />}
                block
              >
                Save Evaluation
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default ProjectEvaluationPage;
