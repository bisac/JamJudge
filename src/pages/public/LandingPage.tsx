import React, { useEffect } from "react";
import { Layout, Typography, Button, Space, Card } from "antd";
import { TrophyOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import type { UserRole } from "../../types";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

// Get default dashboard path based on user role
const getDefaultPath = (role: UserRole): string => {
  switch (role) {
    case "organizer":
      return "/organizer/dashboard";
    case "jury":
      return "/jury/dashboard";
    case "participant":
      return "/participant/dashboard";
    default:
      return "/";
  }
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthContext();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && user.role) {
      const defaultPath = getDefaultPath(user.role);
      navigate(defaultPath, { replace: true });
    }
  }, [user, navigate]);

  // Don't render content if redirecting
  if (isLoading || user) {
    return null;
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Content
        style={{
          maxWidth: 900,
          width: "100%",
          padding: "40px 24px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            borderRadius: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
          bodyStyle={{
            padding: "48px 32px",
          }}
        >
          {/* Logo/Icon */}
          <div style={{ marginBottom: 24 }}>
            <TrophyOutlined
              style={{
                fontSize: 72,
                color: "#667eea",
              }}
            />
          </div>

          {/* Main Heading */}
          <Title level={1} style={{ marginBottom: 16, fontSize: 42 }}>
            JamJudge
          </Title>

          {/* Tagline */}
          <Paragraph
            style={{
              fontSize: 18,
              color: "#666",
              marginBottom: 32,
              maxWidth: 600,
              margin: "0 auto 32px",
            }}
          >
            Profesjonalny system oceniania projektów hackathonowych. Zarządzaj
            wydarzeniami, zespołami i oceną jury w jednym miejscu.
          </Paragraph>

          {/* CTA Buttons */}
          <Space size="large" style={{ marginBottom: 48 }}>
            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              onClick={() => navigate("/auth/login")}
              style={{
                height: 48,
                fontSize: 16,
                paddingLeft: 32,
                paddingRight: 32,
                borderRadius: 8,
              }}
            >
              Zaloguj się
            </Button>
            <Button
              size="large"
              icon={<TeamOutlined />}
              onClick={() => navigate("/auth/sign-up")}
              style={{
                height: 48,
                fontSize: 16,
                paddingLeft: 32,
                paddingRight: 32,
                borderRadius: 8,
              }}
            >
              Zarejestruj się
            </Button>
          </Space>

          {/* Features */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
              marginTop: 48,
              textAlign: "left",
            }}
          >
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>
                🎯 Dla Uczestników
              </Title>
              <Text type="secondary">
                Zgłaszaj projekty, zarządzaj zespołem i śledź wyniki.
              </Text>
            </div>
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>
                ⚖️ Dla Jury
              </Title>
              <Text type="secondary">
                Oceniaj projekty według kryteriów i przekazuj feedback.
              </Text>
            </div>
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>
                🎪 Dla Organizatorów
              </Title>
              <Text type="secondary">
                Konfiguruj wydarzenia, kryteria i publikuj wyniki.
              </Text>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <Text style={{ color: "inherit" }}>
            JamJudge © 2025 - System oceniania hackathonów
          </Text>
        </div>
      </Content>
    </Layout>
  );
};

export default LandingPage;
