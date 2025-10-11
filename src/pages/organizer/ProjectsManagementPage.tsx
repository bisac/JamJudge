import { useState } from "react";
import { Typography, Space, Spin, Alert, Radio, Card, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useProjectsManagement } from "../../hooks/useProjectsManagement";
import { useActiveEvent } from "../../hooks/useActiveEvent";
import useMediaQuery from "../../hooks/useMediaQuery";
import ProjectsTable from "../../components/organizer/ProjectsTable";
import ForceUnlockModal from "../../components/organizer/ForceUnlockModal";
import type { ProjectDetailsViewModel } from "../../hooks/useProjectsManagement";
import type { ProjectStatus } from "../../types";

const { Title } = Typography;

const ProjectsManagementPage = () => {
  const { event } = useActiveEvent();
  const { projects, forceUnlock, isLoading, error } = useProjectsManagement(
    event?.id || null,
  );
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all",
  );
  const [selectedProject, setSelectedProject] =
    useState<ProjectDetailsViewModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleOpenModal = (project: ProjectDetailsViewModel) => {
    // Show confirmation before opening unlock modal
    Modal.confirm({
      title: "Force Unlock Project",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to unlock "${project.name}"? This action will be logged for audit purposes.`,
      okText: "Yes, proceed",
      cancelText: "Cancel",
      onOk() {
        setSelectedProject(project);
        setIsModalOpen(true);
      },
    });
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    setIsModalOpen(false);
  };

  const handleForceUnlock = async (reason: string, unlockMinutes: number) => {
    if (!selectedProject) return;
    await forceUnlock(selectedProject.id, reason, unlockMinutes);
    handleCloseModal();
  };

  const filteredProjects =
    statusFilter === "all"
      ? projects
      : projects.filter((project) => project.status === statusFilter);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error.message} type="error" />;
  }

  return (
    <div style={{ padding: isMobile ? "16px" : "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "stretch" : "center",
              gap: isMobile ? "16px" : "0",
            }}
          >
            <Title level={2} style={{ margin: 0 }}>
              Projects Management
            </Title>
            <Radio.Group
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="draft">Draft</Radio.Button>
              <Radio.Button value="submitted">Submitted</Radio.Button>
            </Radio.Group>
          </div>
        </Card>

        <ProjectsTable
          projects={filteredProjects}
          onForceUnlock={handleOpenModal}
          isMobile={isMobile}
        />
      </Space>

      <ForceUnlockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleForceUnlock}
        project={selectedProject}
      />
    </div>
  );
};

export default ProjectsManagementPage;
