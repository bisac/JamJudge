import React, { useState } from "react";
import { Form, Input, Button, Card, Alert, Typography, Result } from "antd";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import type { ResetPasswordFormViewModel } from "../../contexts/AuthContext";

const { Text } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [form] = Form.useForm<ResetPasswordFormViewModel>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuthContext();

  const onFinish = async (values: ResetPasswordFormViewModel) => {
    setLoading(true);
    setError(null);

    try {
      await resetPassword(values.email);
      setSuccess(true);
    } catch (err: unknown) {
      // For security reasons, we show a generic success message even on errors
      // to prevent user enumeration attacks
      // However, we log the error for debugging
      console.error("Password reset error:", err);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <Result
          status="success"
          title="Link resetujący został wysłany"
          subTitle="Jeśli konto o podanym adresie email istnieje, wysłaliśmy na nie link do resetowania hasła. Sprawdź swoją skrzynkę pocztową."
          extra={[
            <Link to="/auth/login" key="login">
              <Button type="primary" size="large">
                Wróć do logowania
              </Button>
            </Link>,
          ]}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Form
        form={form}
        name="reset-password"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Text type="secondary">
            Podaj adres email powiązany z Twoim kontem. Wyślemy Ci link do
            resetowania hasła.
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Proszę podać adres email." },
            { type: "email", message: "Proszę podać prawidłowy adres email." },
          ]}
        >
          <Input placeholder="twoj@email.com" size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Wyślij link
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>
            Pamiętasz hasło? <Link to="/auth/login">Zaloguj się</Link>
          </Text>
        </div>
      </Form>
    </Card>
  );
};

export default ResetPasswordPage;
