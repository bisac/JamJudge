import React, { useCallback, useMemo } from "react";
import { Tabs, Result, Spin, Alert, Button, message } from "antd";
import { useEventContext } from "../../hooks/useEventContext";
import { useProjectData } from "../../hooks/useProjectData";
import { useProjectGuards } from "../../hooks/useProjectGuards";
import { useParticipantTeam } from "../../hooks/useParticipantTeam";
import { useAuthContext } from "../../hooks/useAuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";

const { TabPane } = Tabs as unknown as typeof Tabs & {
  TabPane: React.FC<{ tab: React.ReactNode; key: string; disabled?: boolean }>;
};

const ProjectDetailsForm = React.lazy(
  () => import("./components/ProjectDetailsForm"),
);
const ProjectFilesUploader = React.lazy(
  () => import("./components/ProjectFilesUploader"),
);
const ProjectPreviewAndSubmit = React.lazy(
  () => import("./components/ProjectPreviewAndSubmit"),
);

const ProjectPage: React.FC = () => {
  const { event } = useEventContext();
  const { projectId, project, attachments, isLoading, error } =
    useProjectData();
  const { isReadOnly, reason } = useProjectGuards(project, event);
  const { team } = useParticipantTeam();
  const { user } = useAuthContext();

  const hasProject = useMemo(
    () => !!projectId && !!project,
    [projectId, project],
  );

  const handleCreateProject = useCallback(async () => {
    if (!event?.id) {
      message.error("No active event");
      return;
    }
    if (!team?.id) {
      message.error("Create a team first");
      return;
    }
    if (!user?.uid) {
      message.error("Not authenticated");
      return;
    }
    try {
      await addDoc(collection(db, "projects"), {
        eventId: event.id,
        teamId: team.id,
        name: "",
        description: null,
        repoUrl: null,
        demoUrl: null,
        status: "draft",
        submittedAt: null,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      message.success("Project created");
    } catch {
      message.error("Failed to create project");
    }
  }, [event?.id, team?.id, user?.uid]);

  if (isLoading) {
    return <Spin size="large" />;
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Failed to load project"
        subTitle={(error as Error).message}
      />
    );
  }

  if (!hasProject) {
    return (
      <Result
        status="info"
        title="No project yet"
        subTitle="Create your team and project to start working on your submission."
        extra={
          team?.id ? (
            <Button type="primary" onClick={handleCreateProject}>
              Create Project
            </Button>
          ) : (
            <Button type="default">
              <Link to="/participant/team">Create Team First</Link>
            </Button>
          )
        }
      />
    );
  }

  return (
    <div>
      {isReadOnly && reason && (
        <Alert
          type="warning"
          message={reason}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}
      <React.Suspense fallback={<Spin />}>
        <Tabs defaultActiveKey="details">
          <TabPane tab="Project Details" key="details">
            <ProjectDetailsForm
              projectId={projectId!}
              project={project!}
              isReadOnly={isReadOnly}
            />
          </TabPane>
          <TabPane tab="Files & Attachments" key="files">
            <ProjectFilesUploader
              projectId={projectId!}
              attachments={attachments}
              isReadOnly={isReadOnly}
            />
          </TabPane>
          <TabPane tab="Preview & Submit" key="preview">
            <ProjectPreviewAndSubmit
              projectId={projectId!}
              project={project!}
              isReadOnly={isReadOnly}
            />
          </TabPane>
        </Tabs>
      </React.Suspense>
    </div>
  );
};

export default ProjectPage;
