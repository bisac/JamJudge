import { Button, Tooltip } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { useAuthContext } from "../../hooks/useAuthContext";

// Placeholder component for switching roles.
// The real implementation would involve updating user state and redirecting.
const RoleSwitcher = () => {
  const { user } = useAuthContext();

  const handleRoleChange = () => {
    alert(`Switching role from ${user?.role}... (Not implemented)`);
  };

  return (
    <Tooltip title="Switch Role (Not Implemented)">
      <Button
        type="text"
        icon={<SwapOutlined />}
        onClick={handleRoleChange}
        style={{ color: "white" }}
      >
        {user?.role.toUpperCase()}
      </Button>
    </Tooltip>
  );
};

export default RoleSwitcher;
