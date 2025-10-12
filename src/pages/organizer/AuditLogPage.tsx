import { useState, useMemo } from "react";
import {
  Typography,
  Space,
  Spin,
  Alert,
  Card,
  Table,
  Select,
  Button,
  Tag,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useAuditLog } from "../../hooks/useAuditLog";
import { useActiveEvent } from "../../hooks/useActiveEvent";
import useMediaQuery from "../../hooks/useMediaQuery";
import type { AuditDTO, AuditAction } from "../../types";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const actionColors: Record<AuditAction, string> = {
  setUserRole: "blue",
  reserveTeamNameAndCreateTeam: "green",
  submitProject: "cyan",
  forceUnlockProject: "orange",
  lockProject: "red",
  publishResults: "purple",
  republishResults: "magenta",
};

const actionLabels: Record<AuditAction, string> = {
  setUserRole: "Set User Role",
  reserveTeamNameAndCreateTeam: "Create Team",
  submitProject: "Submit Project",
  forceUnlockProject: "Force Unlock",
  lockProject: "Lock Project",
  publishResults: "Publish Results",
  republishResults: "Republish Results",
};

const AuditLogPage = () => {
  const { event } = useActiveEvent();
  const [actionFilter, setActionFilter] = useState<AuditAction | undefined>(
    undefined,
  );
  const { audits, isLoading, error, hasMore, loadMore } = useAuditLog(
    event?.id || null,
    actionFilter,
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  const columns: ColumnsType<AuditDTO> = useMemo(
    () => [
      {
        title: "Date & Time",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        render: (timestamp) => timestamp.toDate().toLocaleString(),
        sorter: (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis(),
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: 180,
        render: (action: AuditAction) => (
          <Tag color={actionColors[action]}>{actionLabels[action]}</Tag>
        ),
      },
      {
        title: "Actor",
        dataIndex: "actorUid",
        key: "actorUid",
        ellipsis: true,
        responsive: ["md"],
      },
      {
        title: "Project ID",
        dataIndex: "projectId",
        key: "projectId",
        ellipsis: true,
        responsive: ["lg"],
        render: (projectId) => projectId || "—",
      },
      {
        title: "Team ID",
        dataIndex: "teamId",
        key: "teamId",
        ellipsis: true,
        responsive: ["lg"],
        render: (teamId) => teamId || "—",
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        ellipsis: true,
        responsive: ["xl"],
        render: (reason) => reason || "—",
      },
    ],
    [],
  );

  if (isLoading && audits.length === 0) {
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
    return (
      <div style={{ padding: isMobile ? "16px" : "24px" }}>
        <Alert
          message="Error"
          description={error.message}
          type="error"
          showIcon
        />
      </div>
    );
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
              Audit Log
            </Title>
            <Select
              placeholder="Filter by action"
              allowClear
              style={{ width: isMobile ? "100%" : 200 }}
              onChange={(value) => setActionFilter(value)}
              value={actionFilter}
              options={[
                { label: "Set User Role", value: "setUserRole" },
                {
                  label: "Create Team",
                  value: "reserveTeamNameAndCreateTeam",
                },
                { label: "Submit Project", value: "submitProject" },
                { label: "Force Unlock", value: "forceUnlockProject" },
                { label: "Lock Project", value: "lockProject" },
                { label: "Publish Results", value: "publishResults" },
                { label: "Republish Results", value: "republishResults" },
              ]}
            />
          </div>
        </Card>

        {audits.length === 0 ? (
          <Card>
            <Alert
              message="No Audit Logs"
              description="No actions have been logged for this event yet."
              type="info"
              showIcon
            />
          </Card>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={audits}
              rowKey="id"
              pagination={false}
              scroll={{ x: "max-content" }}
              loading={isLoading}
            />
            {hasMore && (
              <div
                style={{
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                <Button
                  type="default"
                  icon={<ReloadOutlined />}
                  onClick={loadMore}
                  loading={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </Card>
        )}
      </Space>
    </div>
  );
};

export default AuditLogPage;
