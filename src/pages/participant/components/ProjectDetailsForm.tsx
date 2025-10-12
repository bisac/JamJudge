import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Input, Typography, Space, Tag } from "antd";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import type { ProjectDTO, UpsertProjectCommand } from "../../../types";
import { useDebouncedSave } from "../../../hooks/useDebouncedSave";

const { Title, Paragraph } = Typography;

export interface ProjectFormViewModel {
  name: string;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
}

interface ProjectDetailsFormProps {
  projectId: string;
  project: ProjectDTO;
  isReadOnly: boolean;
}

const normalizeForm = (project: ProjectDTO): ProjectFormViewModel => ({
  name: project.name || "",
  description: project.description ?? null,
  repoUrl: project.repoUrl ?? null,
  demoUrl: project.demoUrl ?? null,
});

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  projectId,
  project,
  isReadOnly,
}) => {
  const [form] = Form.useForm<ProjectFormViewModel>();

  const save = useCallback(
    async (values: Partial<ProjectFormViewModel>) => {
      const updates: Partial<UpsertProjectCommand> & { updatedAt: Timestamp } =
        {
          updatedAt: Timestamp.now(),
        };

      if (values.name !== undefined) updates.name = values.name;
      if (values.description !== undefined)
        updates.description = values.description;
      if (values.repoUrl !== undefined) updates.repoUrl = values.repoUrl;
      if (values.demoUrl !== undefined) updates.demoUrl = values.demoUrl;

      await updateDoc(doc(db, "projects", projectId), updates);
    },
    [projectId],
  );

  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const { setValues, isSaving } = useDebouncedSave<
    Partial<ProjectFormViewModel>
  >(save, {
    delayMs: 1000,
    onSuccess: () => setSavedAt(new Date()),
  });

  const saveIndicator = useMemo(() => {
    if (isSaving) return <Tag color="processing">Saving…</Tag>;
    if (savedAt) return <Tag color="success">Saved</Tag>;
    return null;
  }, [isSaving, savedAt]);

  useEffect(() => {
    form.setFieldsValue(normalizeForm(project));
  }, [form, projectId, project]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Title level={4} style={{ marginBottom: 8 }}>
          Project Details
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Your changes are saved automatically.
        </Paragraph>
      </div>

      {saveIndicator}

      <Form<ProjectFormViewModel>
        form={form}
        layout="vertical"
        disabled={isReadOnly}
        onValuesChange={(_, values) => setValues(values)}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: "Please enter project name" },
            { max: 100 },
          ]}
        >
          <Input placeholder="Awesome Hack Project" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ max: 2000 }]}
        >
          <Input.TextArea
            rows={6}
            placeholder="Short description of your project"
          />
        </Form.Item>

        <Form.Item
          label="Repository URL"
          name="repoUrl"
          rules={[
            {
              type: "url",
              message: "Please enter a valid URL",
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                return value.startsWith("https://")
                  ? Promise.resolve()
                  : Promise.reject(new Error("URL must start with https://"));
              },
            },
          ]}
        >
          <Input placeholder="https://github.com/your/repo" />
        </Form.Item>

        <Form.Item
          label="Demo URL"
          name="demoUrl"
          rules={[
            {
              type: "url",
              message: "Please enter a valid URL",
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                return value.startsWith("https://")
                  ? Promise.resolve()
                  : Promise.reject(new Error("URL must start with https://"));
              },
            },
          ]}
        >
          <Input placeholder="https://demo.example.com" />
        </Form.Item>
      </Form>
    </Space>
  );
};

export default ProjectDetailsForm;
