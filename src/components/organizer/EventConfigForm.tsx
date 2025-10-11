import { useEffect } from "react";
import { Form, Input, DatePicker, Button, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { Timestamp } from "firebase/firestore";
import type { EventDTO, UpsertEventCommand } from "../../types";

interface EventFormValues {
  name: string;
  timezone: string;
  registrationDeadline: Dayjs | null;
  submissionDeadline: Dayjs | null;
  ratingStartAt: Dayjs | null;
  ratingEndAt: Dayjs | null;
  resultsPublishedAt: Dayjs | null;
}

interface EventConfigFormProps {
  initialData: EventDTO | null;
  onSave: (values: Partial<UpsertEventCommand>) => Promise<void>;
  isSaving: boolean;
}

// Common timezone options
const TIMEZONE_OPTIONS = [
  { label: "UTC", value: "UTC" },
  { label: "Europe/Warsaw (CET/CEST)", value: "Europe/Warsaw" },
  { label: "America/New_York (EST/EDT)", value: "America/New_York" },
  { label: "America/Los_Angeles (PST/PDT)", value: "America/Los_Angeles" },
  { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
];

const EventConfigForm = ({
  initialData,
  onSave,
  isSaving,
}: EventConfigFormProps) => {
  const [form] = Form.useForm<EventFormValues>();

  // Initialize form with data from Firestore (or empty for new event)
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        timezone: initialData.timezone,
        registrationDeadline: initialData.registrationDeadline
          ? dayjs(initialData.registrationDeadline.toDate())
          : null,
        submissionDeadline: initialData.submissionDeadline
          ? dayjs(initialData.submissionDeadline.toDate())
          : null,
        ratingStartAt: initialData.ratingStartAt
          ? dayjs(initialData.ratingStartAt.toDate())
          : null,
        ratingEndAt: initialData.ratingEndAt
          ? dayjs(initialData.ratingEndAt.toDate())
          : null,
        resultsPublishedAt: initialData.resultsPublishedAt
          ? dayjs(initialData.resultsPublishedAt.toDate())
          : null,
      });
    } else {
      // Reset to defaults for new event
      form.resetFields();
    }
  }, [initialData, form]);

  const handleSubmit = async (values: EventFormValues) => {
    // Pass Dayjs objects directly - the updateEvent hook will handle conversion to Firestore Timestamps
    const updates: Partial<UpsertEventCommand> = {
      name: values.name,
      timezone: values.timezone,
      registrationDeadline: (values.registrationDeadline ||
        null) as Timestamp | null,
      submissionDeadline: (values.submissionDeadline ||
        null) as Timestamp | null,
      ratingStartAt: (values.ratingStartAt || null) as Timestamp | null,
      ratingEndAt: (values.ratingEndAt || null) as Timestamp | null,
      resultsPublishedAt: (values.resultsPublishedAt ||
        null) as Timestamp | null,
    };

    await onSave(updates);
  };

  return (
    <Form<EventFormValues>
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={isSaving}
      initialValues={{
        timezone: "UTC",
      }}
    >
      <Form.Item
        label="Event Name"
        name="name"
        rules={[
          { required: true, message: "Please enter the event name" },
          { min: 3, message: "Event name must be at least 3 characters" },
        ]}
      >
        <Input placeholder="e.g., Spring Hackathon 2025" />
      </Form.Item>

      <Form.Item
        label="Timezone"
        name="timezone"
        rules={[{ required: true, message: "Please select a timezone" }]}
      >
        <Select
          placeholder="Select timezone"
          options={TIMEZONE_OPTIONS}
          showSearch
        />
      </Form.Item>

      <Form.Item
        label="Registration Deadline"
        name="registrationDeadline"
        tooltip="Last date for participants to register for the event"
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          style={{ width: "100%" }}
          placeholder="Select date and time"
        />
      </Form.Item>

      <Form.Item
        label="Submission Deadline"
        name="submissionDeadline"
        tooltip="Last date for teams to submit their projects"
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              const registrationDeadline = getFieldValue(
                "registrationDeadline",
              );
              if (
                !value ||
                !registrationDeadline ||
                value.isAfter(registrationDeadline)
              ) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  "Submission deadline must be after registration deadline",
                ),
              );
            },
          }),
        ]}
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          style={{ width: "100%" }}
          placeholder="Select date and time"
        />
      </Form.Item>

      <Form.Item
        label="Rating Period Start"
        name="ratingStartAt"
        tooltip="When jury members can start rating projects"
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              const submissionDeadline = getFieldValue("submissionDeadline");
              if (
                !value ||
                !submissionDeadline ||
                value.isAfter(submissionDeadline)
              ) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Rating start must be after submission deadline"),
              );
            },
          }),
        ]}
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          style={{ width: "100%" }}
          placeholder="Select date and time"
        />
      </Form.Item>

      <Form.Item
        label="Rating Period End"
        name="ratingEndAt"
        tooltip="Last date for jury to complete their evaluations"
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              const ratingStartAt = getFieldValue("ratingStartAt");
              if (!value || !ratingStartAt || value.isAfter(ratingStartAt)) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Rating end must be after rating start"),
              );
            },
          }),
        ]}
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          style={{ width: "100%" }}
          placeholder="Select date and time"
        />
      </Form.Item>

      <Form.Item
        label="Results Published At"
        name="resultsPublishedAt"
        tooltip="When results will be publicly available"
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          style={{ width: "100%" }}
          placeholder="Select date and time"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isSaving}>
          {initialData ? "Save Changes" : "Create Event"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EventConfigForm;
