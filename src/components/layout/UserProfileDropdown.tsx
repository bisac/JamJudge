import { useNavigate } from "react-router-dom";
import { Avatar, Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../hooks/useAuthContext";

const UserProfileDropdown = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "profile":
        // Assuming a profile page exists at /profile
        navigate("/profile");
        break;
      case "logout":
        signOut();
        // After signing out, you'll likely be redirected to a login page
        // by a route guard, so no explicit navigation is needed here.
        break;
      default:
        break;
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "My Profile",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          <Avatar src={user.photoURL} icon={<UserOutlined />} />
          <Typography.Text style={{ color: "white" }}>
            {user.displayName}
          </Typography.Text>
        </Space>
      </a>
    </Dropdown>
  );
};

export default UserProfileDropdown;
