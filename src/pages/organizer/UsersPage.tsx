import React, { useEffect, useMemo, useState } from "react";
import { Alert, Space, Spin, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { collection, onSnapshot, query, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import type { UserProfileDTO } from "../../types";

const { Title, Text } = Typography;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfileDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const usersCol = collection(db, "users");
    const q = query(usersCol);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: UserProfileDTO[] = snapshot.docs.map((docSnap) => ({
          uid: docSnap.id,
          ...(docSnap.data() as Omit<UserProfileDTO, "uid">),
        }));
        setUsers(data);
        setIsLoading(false);
      },
      (err) => {
        // Surface errors (e.g., permission-denied if not organizer)
        setError(err as Error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const columns: ColumnsType<UserProfileDTO> = useMemo(
    () => [
      {
        title: "User",
        key: "user",
        render: (_value, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>{record.displayName || record.email}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </Space>
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (role: UserProfileDTO["role"]) => {
          const color =
            role === "organizer" ? "red" : role === "jury" ? "green" : "blue";
          return <Tag color={color}>{role}</Tag>;
        },
      },
      {
        title: "Created",
        key: "createdAt",
        render: (_value, record) => {
          const createdTs = record.createdAt as unknown;
          const created =
            createdTs &&
            typeof createdTs === "object" &&
            createdTs !== null &&
            "toDate" in createdTs
              ? (createdTs as Timestamp).toDate()
              : undefined;
          return created ? created.toLocaleString() : "—";
        },
      },
      {
        title: "Updated",
        key: "updatedAt",
        render: (_value, record) => {
          const updatedTs = record.updatedAt as unknown;
          const updated =
            updatedTs &&
            typeof updatedTs === "object" &&
            updatedTs !== null &&
            "toDate" in updatedTs
              ? (updatedTs as Timestamp).toDate()
              : undefined;
          return updated ? updated.toLocaleString() : "—";
        },
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
      <Alert
        message="Failed to load users"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Users Management
        </Title>
        <Table<UserProfileDTO>
          rowKey="uid"
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Space>
    </div>
  );
};

export default UsersPage;
