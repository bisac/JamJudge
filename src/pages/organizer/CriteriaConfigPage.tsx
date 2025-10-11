import { useState, useMemo } from "react";
import {
  Typography,
  Button,
  Spin,
  Result,
  notification,
  Alert,
  Card,
  Space,
} from "antd";
import { PlusOutlined, LockOutlined } from "@ant-design/icons";
import { useActiveEvent } from "../../hooks/useActiveEvent";
import { useEventCriteria } from "../../hooks/useEventCriteria";
import CriteriaTable from "../../components/organizer/CriteriaTable";
import CriterionModal from "../../components/organizer/CriterionModal";
import type { CriterionDTO } from "../../types";

const { Title } = Typography;

interface CriterionFormValues {
  name: string;
  weight: number;
  scaleMin: number;
  scaleMax: number;
}

const CriteriaConfigPage = () => {
  const {
    event,
    isLoading: eventLoading,
    error: eventError,
  } = useActiveEvent();
  const {
    criteria,
    isLoading: criteriaLoading,
    error: criteriaError,
    addCriterion,
    updateCriterion,
    deleteCriterion,
  } = useEventCriteria(event?.id ?? null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<CriterionDTO | null>(
    null,
  );

  // Check if criteria editing is locked (rating period has started)
  const isLocked = useMemo(() => {
    if (!event?.ratingStartAt) return false;
    const now = new Date();
    const ratingStart = event.ratingStartAt.toDate();
    return now >= ratingStart;
  }, [event?.ratingStartAt]);

  const handleAddClick = () => {
    setEditingCriterion(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (criterion: CriterionDTO) => {
    setEditingCriterion(criterion);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCriterion(null);
  };

  const handleModalSubmit = async (values: CriterionFormValues) => {
    try {
      if (editingCriterion) {
        // Update existing criterion
        await updateCriterion(editingCriterion.id, values);
        notification.success({
          message: "Success",
          description: "Criterion has been updated successfully.",
        });
      } else {
        // Add new criterion
        await addCriterion(values);
        notification.success({
          message: "Success",
          description: "Criterion has been added successfully.",
        });
      }
    } catch (err) {
      console.error("Error saving criterion:", err);
      notification.error({
        message: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to save criterion. Please try again.",
      });
      throw err; // Re-throw to prevent modal from closing
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCriterion(id);
      notification.success({
        message: "Success",
        description: "Criterion has been deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting criterion:", err);
      notification.error({
        message: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to delete criterion. Please try again.",
      });
    }
  };

  if (eventLoading) {
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

  if (eventError || !event) {
    return (
      <Result
        status="error"
        title="Failed to Load Event"
        subTitle={
          eventError?.message ||
          "Could not load the active event configuration."
        }
      />
    );
  }

  if (criteriaError) {
    return (
      <Result
        status="error"
        title="Failed to Load Criteria"
        subTitle={
          criteriaError.message || "Could not load criteria for this event."
        }
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Evaluation Criteria
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddClick}
          disabled={isLocked}
        >
          Add Criterion
        </Button>
      </div>

      {isLocked && (
        <Alert
          message="Criteria Editing Locked"
          description={
            <Space direction="vertical" size="small">
              <div>
                <LockOutlined /> The rating period has started. Criteria can no
                longer be modified to ensure fairness in the evaluation process.
              </div>
              {event.ratingStartAt && (
                <div>
                  Rating started:{" "}
                  <strong>
                    {event.ratingStartAt.toDate().toLocaleString()}
                  </strong>
                </div>
              )}
            </Space>
          }
          type="warning"
          showIcon
          style={{ marginBottom: "24px" }}
        />
      )}

      <Card>
        <CriteriaTable
          criteria={criteria}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isLocked={isLocked}
          isLoading={criteriaLoading}
        />
      </Card>

      <CriterionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingCriterion}
      />
    </div>
  );
};

export default CriteriaConfigPage;
