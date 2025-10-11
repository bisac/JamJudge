import { Layout, Space } from "antd";
import UserProfileDropdown from "./UserProfileDropdown";
import RoleSwitcher from "./RoleSwitcher";
import { useAuthContext } from "../../hooks/useAuthContext";

const { Header } = Layout;

const AppHeader = () => {
  const { hasMultipleRoles } = useAuthContext();

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <div className="logo" style={{ color: "white" }}>
        JamJudge
      </div>
      <Space size="middle">
        {hasMultipleRoles && <RoleSwitcher />}
        <UserProfileDropdown />
      </Space>
    </Header>
  );
};

export default AppHeader;
