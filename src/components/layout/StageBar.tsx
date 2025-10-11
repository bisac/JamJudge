import { Alert, Space, Statistic, Typography } from "antd";
import { useEventContext } from "../../hooks/useEventContext";
import type { EventStage } from "../../types";
import type { Timestamp } from "firebase/firestore";

const { Countdown } = Statistic;
const { Text } = Typography;

const getStageInfo = (
  stage: EventStage,
  deadlines: { submission: Timestamp | null; rating: Timestamp | null },
): { message: string; deadline: number | null; showCountdown: boolean } => {
  switch (stage) {
    case "registration":
      return {
        message: "Registration is open.",
        deadline: null,
        showCountdown: false,
      };
    case "work_in_progress":
      return {
        message: "Project submission phase is ongoing.",
        deadline: deadlines.submission?.toMillis() || null,
        showCountdown: true,
      };
    case "rating":
      return {
        message: "The jury is now rating the projects.",
        deadline: deadlines.rating?.toMillis() || null,
        showCountdown: true,
      };
    case "finished":
      return {
        message: "The event has finished. Stay tuned for the results!",
        deadline: null,
        showCountdown: false,
      };
    default:
      return {
        message: "Welcome to the event!",
        deadline: null,
        showCountdown: false,
      };
  }
};

const StageBar = () => {
  const { currentStage, deadlines } = useEventContext();
  const { message, deadline, showCountdown } = getStageInfo(
    currentStage,
    deadlines,
  );

  const countdownTitle =
    currentStage === "work_in_progress"
      ? "Time to submit:"
      : "Time to finish rating:";

  return (
    <Alert
      style={{ marginBottom: "16px" }}
      message={
        <Space size="large">
          <Text strong>{message}</Text>
          {showCountdown && deadline && (
            <Countdown
              title={<Text>{countdownTitle}</Text>}
              value={deadline}
              format="D day(s) H:m:s"
            />
          )}
        </Space>
      }
      type="info"
    />
  );
};

export default StageBar;
