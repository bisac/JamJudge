import React from "react";
import { Card, Result, Button, Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

const { Paragraph, Text } = Typography;

const PendingActivationPage: React.FC = () => {
  const { signOut, user, firebaseUser } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth/login", { replace: true });
  };

  const userEmail = user?.email || firebaseUser?.email || "brak danych";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
        padding: "24px",
      }}
    >
      <Card style={{ maxWidth: 500, width: "100%" }}>
        <Result
          icon={<ClockCircleOutlined style={{ color: "#faad14" }} />}
          title="Twoje konto oczekuje na aktywację"
          subTitle="Dziękujemy za rejestrację w JamJudge!"
          extra={[
            <Button key="logout" onClick={handleLogout}>
              Wyloguj się
            </Button>,
          ]}
        >
          <div style={{ marginTop: 16 }}>
            <Paragraph>
              Twoje konto zostało pomyślnie utworzone, ale wymaga aktywacji
              przez organizatora wydarzenia.
            </Paragraph>
            <Paragraph>
              <Text strong>Email:</Text> {userEmail}
            </Paragraph>
            <Paragraph type="secondary">
              Organizator przypisze Ci odpowiednią rolę (Uczestnik, Jury lub
              Organizator). Po aktywacji będziesz mógł zalogować się ponownie i
              korzystać z pełnej funkcjonalności systemu.
            </Paragraph>
            <Paragraph type="secondary">
              Jeśli masz pytania, skontaktuj się z organizatorem wydarzenia.
            </Paragraph>
          </div>
        </Result>
      </Card>
    </div>
  );
};

export default PendingActivationPage;
