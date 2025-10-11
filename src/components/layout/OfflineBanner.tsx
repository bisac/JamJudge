import { Alert } from "antd";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div style={{ position: "fixed", bottom: 0, width: "100%", zIndex: 1000 }}>
      <Alert
        message="You are currently offline"
        description="Some features may be unavailable. Your changes will be synced once you're back online."
        type="warning"
        showIcon
        closable
      />
    </div>
  );
};

export default OfflineBanner;
