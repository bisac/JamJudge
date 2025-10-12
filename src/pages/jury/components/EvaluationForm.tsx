import React, { useEffect, useState } from "react";
import {
  Form,
  InputNumber,
  Input,
  Slider,
  Space,
  Typography,
  Alert,
  Row,
  Col,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { CriterionDTO, ProjectEvaluationDTO } from "../../../types";
import { useDebouncedSave } from "../../../hooks/useDebouncedSave";
import type { EvaluationFormData } from "../../../hooks/useProjectEvaluation";

const { TextArea } = Input;
const { Text, Title } = Typography;

interface EvaluationFormProps {
  criteria: CriterionDTO[];
  initialEvaluation: ProjectEvaluationDTO | null;
  onSave: (data: EvaluationFormData) => Promise<void>;
  disabled?: boolean;
}

type SaveStatus = "idle" | "pending" | "saving" | "saved";

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  criteria,
  initialEvaluation,
  onSave,
  disabled = false,
}) => {
  const [form] = Form.useForm();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Initialize form with existing evaluation data
  useEffect(() => {
    if (initialEvaluation) {
      form.setFieldsValue({
        scores: initialEvaluation.scores || {},
        feedback: initialEvaluation.feedback || "",
      });
    }
  }, [initialEvaluation, form]);

  // Debounced save implementation
  const { isSaving, setValues } = useDebouncedSave<EvaluationFormData>(onSave, {
    delayMs: 1500,
    onSuccess: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("idle");
    },
  });

  useEffect(() => {
    if (isSaving) {
      setSaveStatus("saving");
    }
  }, [isSaving]);

  // Handle form value changes
  const handleValuesChange = () => {
    if (disabled) return;

    setSaveStatus("pending");
    const values = form.getFieldsValue();
    setValues({
      scores: values.scores || {},
      feedback: values.feedback || null,
    });
  };

  // Save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "pending":
        return (
          <Space>
            <ClockCircleOutlined style={{ color: "#1890ff" }} />
            <Text type="secondary">Unsaved changes...</Text>
          </Space>
        );
      case "saving":
        return (
          <Space>
            <SyncOutlined spin style={{ color: "#1890ff" }} />
            <Text type="secondary">Saving...</Text>
          </Space>
        );
      case "saved":
        return (
          <Space>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <Text type="success">Saved</Text>
          </Space>
        );
      default:
        return null;
    }
  };

  if (criteria.length === 0) {
    return (
      <Alert
        message="No Evaluation Criteria"
        description="The organizer has not yet defined evaluation criteria for this event. Please check back later."
        type="info"
        showIcon
      />
    );
  }

  return (
    <div>
      {/* Save Status Indicator */}
      <div style={{ marginBottom: 16, minHeight: 24 }}>
        {renderSaveStatus()}
      </div>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        disabled={disabled}
      >
        <Title level={4}>Evaluation Criteria</Title>

        {criteria.map((criterion) => {
          const min = criterion.scaleMin ?? 0;
          const max = criterion.scaleMax ?? 10;

          return (
            <div
              key={criterion.id}
              style={{
                marginBottom: 24,
                padding: 16,
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                backgroundColor: "#fafafa",
              }}
            >
              <Row gutter={16} align="middle">
                <Col xs={24} md={12}>
                  <Space
                    direction="vertical"
                    size={0}
                    style={{ width: "100%" }}
                  >
                    <Text strong style={{ fontSize: 16 }}>
                      {criterion.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Weight: {criterion.weight} | Scale: {min}-{max}
                    </Text>
                  </Space>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name={["scores", criterion.id]}
                    rules={[
                      {
                        required: true,
                        message: `Please rate ${criterion.name}`,
                      },
                      {
                        type: "number",
                        min,
                        max,
                        message: `Score must be between ${min} and ${max}`,
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Row gutter={16} align="middle">
                      <Col flex="auto">
                        <Slider
                          min={min}
                          max={max}
                          step={0.1}
                          marks={{
                            [min]: min.toString(),
                            [max]: max.toString(),
                          }}
                          tooltip={{ formatter: (value) => value?.toFixed(1) }}
                        />
                      </Col>
                      <Col>
                        <InputNumber
                          min={min}
                          max={max}
                          step={0.1}
                          precision={1}
                          style={{ width: 80 }}
                        />
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          );
        })}

        <Title level={4} style={{ marginTop: 32 }}>
          Feedback (Optional)
        </Title>

        <Form.Item name="feedback">
          <TextArea
            rows={6}
            placeholder="Provide your feedback for this project. Share constructive comments about strengths, areas for improvement, or any other observations."
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default EvaluationForm;
