import { Table, Tag, Space, Typography, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TeamWithMembersViewModel } from "../../hooks/useTeamsManagement";

const { Text } = Typography;

interface TeamsTableProps {
  teams: TeamWithMembersViewModel[];
  isMobile?: boolean;
}

const TeamsTable = ({ teams, isMobile = false }: TeamsTableProps) => {
  const columns: ColumnsType<TeamWithMembersViewModel> = [
    {
      title: "Team Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string | null) => description || "-",
      ellipsis: true,
    },
    {
      title: "Members",
      key: "members",
      render: (_, record) => (
        <Space size="small" wrap>
          {record.members.length > 0 ? (
            record.members.map((member) => (
              <Tag key={member.uid} color="blue">
                {member.displayName || member.email}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No members</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (timestamp: unknown) => {
        if (!timestamp) return "-";
        const date =
          typeof timestamp === "object" &&
          timestamp !== null &&
          "toDate" in timestamp
            ? (timestamp as { toDate: () => Date }).toDate()
            : new Date(timestamp as string | number);
        return date.toLocaleDateString();
      },
      sorter: (a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        const dateA = a.createdAt.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt.seconds * 1000);
        const dateB = b.createdAt.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt.seconds * 1000);
        return dateA.getTime() - dateB.getTime();
      },
    },
  ];

  // Mobile view - use Card-based layout
  if (isMobile) {
    return (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {teams.map((team) => (
          <Card key={team.id} size="small">
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              {team.name}
            </Typography.Title>
            {team.description && (
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 8 }}
              >
                {team.description}
              </Text>
            )}
            <div style={{ marginTop: 8 }}>
              <Text strong>Members: </Text>
              <Space size="small" wrap style={{ marginTop: 4 }}>
                {team.members.length > 0 ? (
                  team.members.map((member) => (
                    <Tag key={member.uid} color="blue">
                      {member.displayName || member.email}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No members</Text>
                )}
              </Space>
            </div>
          </Card>
        ))}
      </Space>
    );
  }

  // Desktop view - use Table
  return (
    <Table
      columns={columns}
      dataSource={teams}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} teams`,
      }}
      scroll={{ x: 800 }}
    />
  );
};

export default TeamsTable;
