import { useEffect } from "react";
import { Form, Input, InputNumber } from "antd";
import type { CriterionDTO } from "../../types";

interface CriterionFormValues {
  name: string;
  weight: number;
  scaleMin: number;
  scaleMax: number;
}

interface CriterionFormProps {
  initialData?: CriterionDTO | null;
  onSubmit: (values: CriterionFormValues) => Promise<void>;
  form: ReturnType<typeof Form.useForm<CriterionFormValues>>[0];
}

const CriterionForm = ({ initialData, onSubmit, form }: CriterionFormProps) => {
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        weight: initialData.weight,
        scaleMin: initialData.scaleMin ?? 0,
        scaleMax: initialData.scaleMax ?? 10,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  return (
    <Form<CriterionFormValues>
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{
        scaleMin: 0,
        scaleMax: 10,
        weight: 1,
      }}
    >
      <Form.Item
        label="Criterion Name"
        name="name"
        rules={[
          { required: true, message: "Please enter the criterion name" },
          { min: 2, message: "Name must be at least 2 characters" },
          { max: 100, message: "Name must be at most 100 characters" },
        ]}
      >
        <Input placeholder="e.g., Innovation, Technical Quality" />
      </Form.Item>

      <Form.Item
        label="Weight"
        name="weight"
        tooltip="Relative importance of this criterion in the final score"
        rules={[
          { required: true, message: "Please enter the weight" },
          { type: "number", min: 0.1, message: "Weight must be at least 0.1" },
          { type: "number", max: 100, message: "Weight must be at most 100" },
        ]}
      >
        <InputNumber
          min={0.1}
          max={100}
          step={0.1}
          style={{ width: "100%" }}
          placeholder="1.0"
        />
      </Form.Item>

      <Form.Item
        label="Minimum Score"
        name="scaleMin"
        tooltip="Minimum value jury can give for this criterion"
        rules={[
          { required: true, message: "Please enter the minimum score" },
          { type: "number", message: "Must be a number" },
        ]}
      >
        <InputNumber
          min={0}
          max={100}
          style={{ width: "100%" }}
          placeholder="0"
        />
      </Form.Item>

      <Form.Item
        label="Maximum Score"
        name="scaleMax"
        tooltip="Maximum value jury can give for this criterion"
        rules={[
          { required: true, message: "Please enter the maximum score" },
          { type: "number", message: "Must be a number" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const scaleMin = getFieldValue("scaleMin");
              if (!value || value > scaleMin) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Maximum score must be greater than minimum score"),
              );
            },
          }),
        ]}
      >
        <InputNumber
          min={1}
          max={100}
          style={{ width: "100%" }}
          placeholder="10"
        />
      </Form.Item>
    </Form>
  );
};

export default CriterionForm;
