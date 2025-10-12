import React, { useEffect, useState } from "react";
import { Layout, Typography, Table, Card, Result, Spin, Button } from "antd";
import { TrophyOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useLeaderboardData } from "../../hooks/useLeaderboardData";
import useMediaQuery from "../../hooks/useMediaQuery";
import type { LeaderboardEntryViewModel, EventDTO } from "../../types";

const { Content } = Layout;
const { Title } = Typography;

/**
 * Placeholder component shown when results are not yet published
 */
const ResultsNotPublishedPlaceholder: React.FC = () => {
  const navigate = useNavigate();

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
};

/**
 * Leaderboard table component with pagination
 */
const LeaderboardTable: React.FC<{
  eventId: string;
  eventName: string;
  publishedAt: Date;
}> = ({ eventId, eventName, publishedAt }) => {
  const navigate = useNavigate();
  const { results, isLoading, error } = useLeaderboardData(eventId);
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (error) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ padding: isMobile ? "20px" : "50px" }}>
          <Result
            status="error"
            title="Error Loading Leaderboard"
            subTitle="There was a problem loading the leaderboard. Please try again later."
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  // Desktop columns - all columns visible
  const desktopColumns = [
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
      render: (name: string) => name,
    },
    {
      title: "Team",
      dataIndex: "teamName",
      key: "teamName",
      render: (name: string) => name,
    },
    {
      title: "Total Score",
      dataIndex: "totalScore",
      key: "totalScore",
      width: 150,
      render: (score: number) => score.toFixed(2),
    },
  ];

  // Mobile columns - compact view
  const mobileColumns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 60,
      render: (rank: number | null) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank || "-";
      },
    },
    {
      title: "Project / Team",
      dataIndex: "projectName",
      key: "projectName",
      render: (name: string, record: LeaderboardEntryViewModel) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.teamName}
          </div>
        </div>
      ),
    },
    {
      title: "Score",
      dataIndex: "totalScore",
      key: "totalScore",
      width: 80,
      render: (score: number) => score.toFixed(2),
    },
  ];

  const columns = isMobile ? mobileColumns : desktopColumns;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          padding: isMobile ? "16px" : "24px 50px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
          <Button
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            size={isMobile ? "small" : "middle"}
          >
            {isMobile ? "Home" : "Back to Home"}
          </Button>
        </div>

        <Card>
          <div
            style={{ textAlign: "center", marginBottom: isMobile ? 16 : 32 }}
          >
            <TrophyOutlined
              style={{
                fontSize: isMobile ? 36 : 48,
                color: "#faad14",
              }}
            />
            <Title
              level={isMobile ? 3 : 2}
              style={{
                marginTop: isMobile ? 8 : 16,
                marginBottom: isMobile ? 4 : 8,
              }}
            >
              {isMobile ? "Leaderboard" : `${eventName} - Leaderboard`}
            </Title>
            <p style={{ color: "#666", fontSize: isMobile ? "12px" : "14px" }}>
              Published on {publishedAt.toLocaleString()}
            </p>
          </div>

          <Table<LeaderboardEntryViewModel>
            dataSource={results}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} projects`,
              simple: isMobile, // Simple pagination for mobile
            }}
            locale={{
              emptyText: "No results available",
            }}
            scroll={isMobile ? { x: "max-content" } : undefined}
          />
        </Card>
      </Content>
    </Layout>
  );
};

/**
 * Public Leaderboard Page
 * Displays event results after they have been published by the organizer
 */
const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch event data directly (without EventContext for public route)
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventsQuery = query(collection(db, "events"), limit(1));
        const snapshot = await getDocs(eventsQuery);
        if (!snapshot.empty) {
          const eventDoc = snapshot.docs[0];
          setEvent({
            id: eventDoc.id,
            ...eventDoc.data(),
          } as EventDTO);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, []);

  const areResultsPublished = !!(event && event.resultsPublishedAt);

  // Loading state
  if (isLoading) {
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

  // No event found
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

  // Results not published yet
  if (!areResultsPublished) {
    return <ResultsNotPublishedPlaceholder />;
  }

  // Display leaderboard
  return (
    <LeaderboardTable
      eventId={event.id}
      eventName={event.name}
      publishedAt={event.resultsPublishedAt!.toDate()}
    />
  );
};

export default LeaderboardPage;
