import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Alert,
  Typography,
  notification,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import type { SignUpFormViewModel } from "../../contexts/AuthContext";
import { getAuthErrorMessage } from "../../utils/firebaseErrors";

const { Text } = Typography;

const SignUpPage: React.FC = () => {
  const [form] = Form.useForm<SignUpFormViewModel & { displayName: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuthContext();
  const navigate = useNavigate();

  const onFinish = async (
    values: SignUpFormViewModel & { displayName: string },
  ) => {
    setLoading(true);
    setError(null);

    try {
      await signUp(values.email, values.password, values.displayName);

      notification.success({
        message: "Rejestracja zakończona pomyślnie!",
        description: "Możesz się teraz zalogować.",
        duration: 5,
      });

      // Redirect to login page after successful registration
      navigate("/auth/login");
    } catch (err: unknown) {
      const errorCode = (err as { code?: string }).code || "unknown";

      // If user was created in Auth but Firestore write failed, show critical error
      if (errorCode === "permission-denied" || errorCode === "unavailable") {
        setError(
          "Konto zostało utworzone, ale wystąpił problem z zapisem profilu. Skontaktuj się z pomocą techniczną.",
        );
      } else {
        setError(getAuthErrorMessage(errorCode));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        name="signup"
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
          label="Imię i nazwisko"
          name="displayName"
          rules={[
            { required: true, message: "Proszę podać imię i nazwisko." },
            {
              min: 2,
              message: "Imię i nazwisko musi mieć co najmniej 2 znaki.",
            },
          ]}
        >
          <Input placeholder="Jan Kowalski" size="large" />
        </Form.Item>

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
          rules={[
            { required: true, message: "Proszę podać hasło." },
            { min: 6, message: "Hasło musi mieć co najmniej 6 znaków." },
          ]}
        >
          <Input.Password placeholder="Hasło" size="large" />
        </Form.Item>

        <Form.Item
          label="Potwierdź hasło"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Proszę potwierdzić hasło." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Hasła nie są identyczne."));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Potwierdź hasło" size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Zarejestruj się
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>
            Masz już konto? <Link to="/auth/login">Zaloguj się</Link>
          </Text>
        </div>
      </Form>
    </Card>
  );
};

export default SignUpPage;
