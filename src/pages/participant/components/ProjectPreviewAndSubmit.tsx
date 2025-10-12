import React, { useCallback, useMemo } from "react";
import { Card, Descriptions, Button, Modal, Alert, Space, message } from "antd";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import type { ProjectDTO, ProjectStatus } from "../../../types";
import { db } from "../../../firebase";

interface Props {
  projectId: string;
  project: ProjectDTO;
  isReadOnly: boolean;
}

const ProjectPreviewAndSubmit: React.FC<Props> = ({
  projectId,
  project,
  isReadOnly,
}) => {
  const fields = useMemo(
    () => [
      { label: "Name", value: project.name || "-" },
      { label: "Description", value: project.description || "-" },
      { label: "Repository", value: project.repoUrl || "-" },
      { label: "Demo", value: project.demoUrl || "-" },
      { label: "Status", value: project.status },
    ],
    [project],
  );

  const canSubmit = useMemo(
    () => project.status !== "submitted" && !isReadOnly,
    [project.status, isReadOnly],
  );

  const handleSubmit = useCallback(() => {
    Modal.confirm({
      title: "Submit Project",
      content:
        "Are you sure you want to submit your project? You will not be able to edit it unless an organizer unlocks it.",
      okText: "Submit",
      okButtonProps: { type: "primary" },
      onOk: async () => {
        try {
          await updateDoc(doc(db, "projects", projectId), {
            status: "submitted" as ProjectStatus,
            submittedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          message.success("Project submitted");
        } catch {
          message.error("Failed to submit project");
        }
      },
    });
  }, [projectId]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {project.status === "submitted" && (
        <Alert type="success" showIcon message="Project has been submitted." />
      )}
      <Card>
        <Descriptions column={1} bordered>
          {fields.map((f) => (
            <Descriptions.Item key={f.label} label={f.label}>
              {f.value}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
      <div>
        <Button type="primary" disabled={!canSubmit} onClick={handleSubmit}>
          Submit Project
        </Button>
      </div>
    </Space>
  );
};

export default ProjectPreviewAndSubmit;
