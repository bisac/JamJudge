import React, { useState, useEffect } from "react";
import { Form, Input, Button, Checkbox, Card, Alert, Typography } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import type { LoginFormViewModel } from "../../contexts/AuthContext";
import type { UserRole } from "../../types";
import { getAuthErrorMessage } from "../../utils/firebaseErrors";

const { Text } = Typography;

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

const LoginPage: React.FC = () => {
  const [form] = Form.useForm<LoginFormViewModel>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect after successful login
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from
        ?.pathname;
      const defaultPath = getDefaultPath(user.role);
      navigate(from || defaultPath, { replace: true });
    }
  }, [user, navigate, location]);

  const onFinish = async (values: LoginFormViewModel) => {
    setLoading(true);
    setError(null);

    try {
      await login(values.email, values.password);
      // Navigation will be handled by useEffect after user state updates
    } catch (err: unknown) {
      const errorCode = (err as { code?: string }).code || "unknown";
      setError(getAuthErrorMessage(errorCode));
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
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

        <Form.Item
          label="Hasło"
          name="password"
          rules={[{ required: true, message: "Proszę podać hasło." }]}
        >
          <Input.Password placeholder="Hasło" size="large" />
        </Form.Item>

        <Form.Item name="rememberMe" valuePropName="checked">
          <Checkbox>Zapamiętaj mnie</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Zaloguj się
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>
            Nie masz konta? <Link to="/auth/sign-up">Zarejestruj się</Link>
          </Text>
          <br />
          <Link to="/auth/reset">Zapomniałeś hasła?</Link>
        </div>
      </Form>
    </Card>
  );
};

export default LoginPage;
