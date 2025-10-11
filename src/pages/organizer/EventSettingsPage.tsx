import { useState } from "react";
import { Typography, Spin, Result, notification, Card } from "antd";
import { useActiveEvent } from "../../hooks/useActiveEvent";
import EventConfigForm from "../../components/organizer/EventConfigForm";
import type { UpsertEventCommand } from "../../types";

const { Title } = Typography;

const EventSettingsPage = () => {
  const { event, isLoading, error, createEvent, updateEvent } =
    useActiveEvent();
  const [isSaving, setIsSaving] = useState(false);

  console.log(
    "[EventSettingsPage] Render - isLoading:",
    isLoading,
    "event:",
    event,
    "error:",
    error,
  );

  const handleSave = async (values: Partial<UpsertEventCommand>) => {
    try {
      setIsSaving(true);
      if (event) {
        // Update existing event
        await updateEvent(values);
        notification.success({
          message: "Success",
          description: "Event settings have been updated successfully.",
        });
      } else {
        // Create new event
        await createEvent(values as UpsertEventCommand);
        notification.success({
          message: "Success",
          description: "Event has been created successfully.",
        });
      }
    } catch (err) {
      console.error("Error saving event:", err);
      notification.error({
        message: "Error",
        description:
          err instanceof Error
            ? err.message
            : `Failed to ${event ? "update" : "create"} event. Please try again.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    console.log("[EventSettingsPage] Showing loading spinner");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    console.log("[EventSettingsPage] Showing error:", error.message);
    return (
      <Result
        status="error"
        title="Failed to Load Event"
        subTitle={error.message}
      />
    );
  }

  console.log(
    "[EventSettingsPage] Showing form - event is",
    event ? "present" : "null (create mode)",
  );

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>{event ? "Event Settings" : "Create New Event"}</Title>
      <Card>
        <EventConfigForm
          initialData={event}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </Card>
    </div>
  );
};

export default EventSettingsPage;
