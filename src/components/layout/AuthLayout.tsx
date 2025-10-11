import React from "react";
import { Outlet } from "react-router-dom";
import { Layout, Typography } from "antd";

const { Content } = Layout;
const { Title } = Typography;

const AuthLayout: React.FC = () => {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <Content
        style={{
          maxWidth: 400,
          width: "100%",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <Title level={2} style={{ marginBottom: 8 }}>
            JamJudge
          </Title>
          <Typography.Text type="secondary">
            System oceniania projektów hackathonowych
          </Typography.Text>
        </div>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AuthLayout;
