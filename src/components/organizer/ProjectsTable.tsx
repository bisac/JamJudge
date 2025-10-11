import { Table, Tag, Button, Space, Dropdown, Card, Typography } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined, UnlockOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ProjectDetailsViewModel } from "../../hooks/useProjectsManagement";
import type { ProjectStatus } from "../../types";

const { Text } = Typography;

interface ProjectsTableProps {
  projects: ProjectDetailsViewModel[];
  onForceUnlock: (project: ProjectDetailsViewModel) => void;
  isMobile?: boolean;
}

const ProjectsTable = ({
  projects,
  onForceUnlock,
  isMobile = false,
}: ProjectsTableProps) => {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "draft":
        return "default";
      case "submitted":
        return "success";
      default:
        return "default";
    }
  };

  const getMenuItems = (
    record: ProjectDetailsViewModel,
  ): MenuProps["items"] => {
    const items: MenuProps["items"] = [];

    if (record.status === "submitted") {
      items.push({
        key: "unlock",
        label: "Force Unlock",
        icon: <UnlockOutlined />,
        onClick: () => onForceUnlock(record),
      });
    }

    return items;
  };

  const columns: ColumnsType<ProjectDetailsViewModel> = [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Team",
      dataIndex: "teamName",
      key: "teamName",
      sorter: (a, b) => a.teamName.localeCompare(b.teamName),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ProjectStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: "Draft", value: "draft" },
        { text: "Submitted", value: "submitted" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Submitted At",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (timestamp: unknown) => {
        if (!timestamp) return "-";
        const date =
          typeof timestamp === "object" &&
          timestamp !== null &&
          "toDate" in timestamp
            ? (timestamp as { toDate: () => Date }).toDate()
            : new Date(timestamp as string | number);
        return date.toLocaleString();
      },
      sorter: (a, b) => {
        if (!a.submittedAt) return 1;
        if (!b.submittedAt) return -1;
        const dateA = a.submittedAt.toDate
          ? a.submittedAt.toDate()
          : new Date(a.submittedAt.seconds * 1000);
        const dateB = b.submittedAt.toDate
          ? b.submittedAt.toDate()
          : new Date(b.submittedAt.seconds * 1000);
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      title: "Force Unlock Until",
      dataIndex: "forceUnlockUntil",
      key: "forceUnlockUntil",
      render: (timestamp: unknown) => {
        if (!timestamp) return "-";
        const date =
          typeof timestamp === "object" &&
          timestamp !== null &&
          "toDate" in timestamp
            ? (timestamp as { toDate: () => Date }).toDate()
            : new Date(timestamp as string | number);
        const now = new Date();
        if (date < now) return <Tag color="default">Expired</Tag>;
        return <Tag color="warning">{date.toLocaleString()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => {
        const menuItems = getMenuItems(record);
        if (!menuItems || menuItems.length === 0) return null;

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // Mobile view - use Card-based layout
  if (isMobile) {
    return (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {projects.map((project) => {
          const menuItems = getMenuItems(project);
          return (
            <Card key={project.id} size="small">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>
                    {project.name}
                  </Typography.Title>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text type="secondary">Team: </Text>
                      <Text>{project.teamName}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Status: </Text>
                      <Tag color={getStatusColor(project.status)}>
                        {project.status.charAt(0).toUpperCase() +
                          project.status.slice(1)}
                      </Tag>
                    </div>
                    {project.submittedAt && (
                      <div>
                        <Text type="secondary">Submitted: </Text>
                        <Text>
                          {project.submittedAt.toDate
                            ? project.submittedAt.toDate().toLocaleDateString()
                            : new Date(
                                project.submittedAt.seconds * 1000,
                              ).toLocaleDateString()}
                        </Text>
                      </div>
                    )}
                    {project.forceUnlockUntil && (
                      <div>
                        <Text type="secondary">Unlock expires: </Text>
                        <Tag color="warning">
                          {project.forceUnlockUntil.toDate
                            ? project.forceUnlockUntil.toDate().toLocaleString()
                            : new Date(
                                project.forceUnlockUntil.seconds * 1000,
                              ).toLocaleString()}
                        </Tag>
                      </div>
                    )}
                  </Space>
                </div>
                {menuItems && menuItems.length > 0 && (
                  <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                )}
              </div>
            </Card>
          );
        })}
      </Space>
    );
  }

  // Desktop view - use Table
  return (
    <Table
      columns={columns}
      dataSource={projects}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} projects`,
      }}
      scroll={{ x: 1000 }}
    />
  );
};

export default ProjectsTable;
