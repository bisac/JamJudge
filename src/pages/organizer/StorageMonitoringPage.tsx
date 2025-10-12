import { useMemo } from "react";
import { Typography, Space, Spin, Alert, Card, Table, Tag } from "antd";
import { FileOutlined } from "@ant-design/icons";
import { useStorageMonitoring } from "../../hooks/useStorageMonitoring";
import { useActiveEvent } from "../../hooks/useActiveEvent";
import useMediaQuery from "../../hooks/useMediaQuery";
import type { StorageUsageViewModel } from "../../hooks/useStorageMonitoring";
import type { ColumnsType } from "antd/es/table";

const { Title, Paragraph } = Typography;

const StorageMonitoringPage = () => {
  const { event } = useActiveEvent();
  const { storageData, isLoading, error } = useStorageMonitoring(
    event?.id || null,
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Calculate total files
  const totalFiles = useMemo(
    () => storageData.reduce((sum, item) => sum + item.filesCount, 0),
    [storageData],
  );

  const columns: ColumnsType<StorageUsageViewModel> = useMemo(
    () => [
      {
        title: "Project Name",
        dataIndex: "projectName",
        key: "projectName",
        ellipsis: true,
        sorter: (a, b) => a.projectName.localeCompare(b.projectName),
      },
      {
        title: "Team",
        dataIndex: "teamName",
        key: "teamName",
        ellipsis: true,
        responsive: ["md"],
        sorter: (a, b) => a.teamName.localeCompare(b.teamName),
      },
      {
        title: "Files Count",
        dataIndex: "filesCount",
        key: "filesCount",
        width: 150,
        align: "center",
        render: (count: number) => (
          <Tag
            color={count > 10 ? "orange" : count > 5 ? "blue" : "default"}
            icon={<FileOutlined />}
          >
            {count} {count === 1 ? "file" : "files"}
          </Tag>
        ),
        sorter: (a, b) => a.filesCount - b.filesCount,
        defaultSortOrder: "descend",
      },
    ],
    [],
  );

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
          <Title level={2} style={{ margin: 0 }}>
            Storage Monitoring
          </Title>
          <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
            Monitor the number of files uploaded by each project. Note: Actual
            file sizes are not available in real-time without backend
            processing.
          </Paragraph>
        </Card>

        {/* Summary Card */}
        <Card>
          <Alert
            message={`Total Files: ${totalFiles}`}
            description={`Across ${storageData.length} ${storageData.length === 1 ? "project" : "projects"}`}
            type="info"
            showIcon
            icon={<FileOutlined />}
          />
        </Card>

        {storageData.length === 0 ? (
          <Card>
            <Alert
              message="No Projects Found"
              description="No projects have been created for this event yet."
              type="info"
              showIcon
            />
          </Card>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={storageData}
              rowKey="projectId"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} projects`,
              }}
              scroll={{ x: "max-content" }}
            />
          </Card>
        )}
      </Space>
    </div>
  );
};

export default StorageMonitoringPage;
