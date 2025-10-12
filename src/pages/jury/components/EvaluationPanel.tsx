import React from "react";
import { Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";
import type { EventDTO } from "../../../types";

interface EvaluationPanelProps {
  event: EventDTO | null;
  currentStage: string;
  children: React.ReactNode;
}

const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  event,
  currentStage,
  children,
}) => {
  // Check if rating period is active
  const isRatingAllowed = currentStage === "rating";

  // Calculate if rating end time has passed
  const ratingEndPassed = event?.ratingEndAt
    ? new Date(event.ratingEndAt.toDate()) < new Date()
    : false;

  const isReadOnly = !isRatingAllowed || ratingEndPassed;

  return (
    <div>
      {isReadOnly && (
        <Alert
          message="Rating Period Ended"
          description={
            <>
              The rating period has ended. You can no longer submit or modify
              evaluations.
              {event?.ratingEndAt && (
                <div style={{ marginTop: 8 }}>
                  <strong>Rating ended:</strong>{" "}
                  {new Date(event.ratingEndAt.toDate()).toLocaleString()}
                </div>
              )}
            </>
          }
          type="warning"
          icon={<LockOutlined />}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Pass isReadOnly to children */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            disabled: isReadOnly,
          } as React.HTMLAttributes<HTMLElement>);
        }
        return child;
      })}
    </div>
  );
};

export default EvaluationPanel;
