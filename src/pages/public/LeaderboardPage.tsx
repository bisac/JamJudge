import React, { useEffect, useState } from "react";
import { Layout, Typography, Table, Card, Result, Spin, Button } from "antd";
import { TrophyOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useEventContext } from "../../hooks/useEventContext";
import type { PublicResultDTO } from "../../types";

const { Content } = Layout;
const { Title } = Typography;

interface LeaderboardEntry extends PublicResultDTO {
  projectName?: string;
  teamName?: string;
}

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { event, isLoading: eventLoading } = useEventContext();
  const [results, setResults] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!event) return;

    const loadResults = async () => {
      setLoading(true);
      try {
        const resultsQuery = query(
          collection(db, "publicResults"),
          orderBy("rank", "asc"),
        );
        const snapshot = await getDocs(resultsQuery);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LeaderboardEntry[];

        setResults(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (event.resultsPublishedAt) {
      loadResults();
    } else {
      setLoading(false);
    }
  }, [event]);

  if (eventLoading || loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ padding: "50px" }}>
          <Result
            status="404"
            title="Event Not Found"
            subTitle="No active event found."
            extra={
              <Button type="primary" onClick={() => navigate("/")}>
                Go Home
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  if (!event.resultsPublishedAt) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            padding: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Result
            icon={<TrophyOutlined />}
            status="info"
            title="Results Not Yet Published"
            subTitle="The event results will be available here once the organizer publishes them. Please check back later!"
            extra={
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={() => navigate("/")}
              >
                Go to Home
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number | null) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank || "-";
      },
    },
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      render: (name: string | undefined, record: LeaderboardEntry) =>
        name || `Project ${record.projectId}`,
    },
    {
      title: "Team",
      dataIndex: "teamName",
      key: "teamName",
      render: (name: string | undefined) => name || "-",
    },
    {
      title: "Total Score",
      dataIndex: "totalScore",
      key: "totalScore",
      width: 150,
      render: (score: number) => score.toFixed(2),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          padding: "24px 50px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Button icon={<HomeOutlined />} onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>

        <Card>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <TrophyOutlined style={{ fontSize: 48, color: "#faad14" }} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
              {event.name} - Leaderboard
            </Title>
            {event.resultsPublishedAt && (
              <p style={{ color: "#666" }}>
                Published on{" "}
                {new Date(event.resultsPublishedAt.toDate()).toLocaleString()}
              </p>
            )}
          </div>

          <Table
            dataSource={results}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} projects`,
            }}
            locale={{
              emptyText: "No results available",
            }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default LeaderboardPage;
