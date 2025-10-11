import { useState } from "react";
import { Button, Typography, Space, Spin, Alert, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTeamsManagement } from "../../hooks/useTeamsManagement";
import { useActiveEvent } from "../../hooks/useActiveEvent";
import { useAuthContext } from "../../hooks/useAuthContext";
import useMediaQuery from "../../hooks/useMediaQuery";
import TeamsTable from "../../components/organizer/TeamsTable";
import AssignUserToTeamModal from "../../components/organizer/AssignUserToTeamModal";

const { Title } = Typography;

const TeamsManagementPage = () => {
  const { event } = useActiveEvent();
  const { user } = useAuthContext();
  const { teams, assignUser, isLoading, error } = useTeamsManagement(
    event?.id || null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAssignUser = async (userId: string, teamId: string) => {
    if (!user) return;
    await assignUser(userId, teamId, user.uid);
    handleCloseModal();
  };

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
              Teams Management
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenModal}
              block={isMobile}
            >
              {isMobile ? "Assign User" : "Assign User to Team"}
            </Button>
          </div>
        </Card>

        <TeamsTable teams={teams} isMobile={isMobile} />
      </Space>

      <AssignUserToTeamModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAssignUser}
        eventId={event?.id || null}
      />
    </div>
  );
};

export default TeamsManagementPage;
