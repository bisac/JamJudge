import { useMemo } from "react";
import { Typography, Space, Spin, Alert, Card, Table, Tag } from "antd";
import { useScoresPreview } from "../../hooks/useScoresPreview";
import { useActiveEvent } from "../../hooks/useActiveEvent";
import useMediaQuery from "../../hooks/useMediaQuery";
import type { ScorePreviewViewModel } from "../../hooks/useScoresPreview";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

const ScoresPreviewPage = () => {
  const { event } = useActiveEvent();
  const { scores, isLoading, error } = useScoresPreview(event?.id || null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const columns: ColumnsType<ScorePreviewViewModel> = useMemo(
    () => [
      {
        title: "Rank",
        key: "rank",
        width: 80,
        render: (_text, _record, index) => (
          <Tag
            color={
              index === 0
                ? "gold"
                : index === 1
                  ? "silver"
                  : index === 2
                    ? "bronze"
                    : "default"
            }
          >
            #{index + 1}
          </Tag>
        ),
      },
      {
        title: "Project Name",
        dataIndex: "projectName",
        key: "projectName",
        ellipsis: true,
      },
      {
        title: "Team",
        dataIndex: "teamName",
        key: "teamName",
        ellipsis: true,
        responsive: ["md"],
      },
      {
        title: "Evaluations",
        dataIndex: "evaluationsCount",
        key: "evaluationsCount",
        width: 120,
        align: "center",
      },
      {
        title: "Average Score",
        dataIndex: "averageScore",
        key: "averageScore",
        width: 150,
        align: "right",
        render: (score: number) => score.toFixed(2),
        sorter: (a, b) => a.averageScore - b.averageScore,
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
            Scores Preview
          </Title>
        </Card>

        {scores.length === 0 ? (
          <Card>
            <Alert
              message="No Scores Available"
              description="No evaluations have been submitted yet. Scores will appear here once jury members start rating projects."
              type="info"
              showIcon
            />
          </Card>
        ) : (
          <Card>
            <Table
              columns={columns}
              dataSource={scores}
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

export default ScoresPreviewPage;
