import { Layout, Space } from "antd";
import UserProfileDropdown from "./UserProfileDropdown";
import RoleSwitcher from "./RoleSwitcher";
import { useAuthContext } from "../../hooks/useAuthContext";
import logo from "/logo.png";

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
      <div
        className="logo"
        style={{ color: "white", display: "flex", alignItems: "center" }}
      >
        <img src={logo} alt="JamJudge Logo" style={{ height: "140px" }} />
      </div>
      <Space size="middle">
        {hasMultipleRoles && <RoleSwitcher />}
        <UserProfileDropdown />
      </Space>
    </Header>
  );
};

export default AppHeader;
