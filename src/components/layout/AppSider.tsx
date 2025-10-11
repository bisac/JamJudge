import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  TrophyOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  AuditOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../hooks/useAuthContext";
import type { UserRole } from "../../types";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const getMenuItems = (role: UserRole): MenuItem[] => {
  const participantItems: MenuItem[] = [
    getItem(
      <Link to="/participant/dashboard">Dashboard</Link>,
      "/participant/dashboard",
      <DashboardOutlined />,
    ),
    getItem(
      <Link to="/participant/team">My Team</Link>,
      "/participant/team",
      <TeamOutlined />,
    ),
    getItem(
      <Link to="/participant/project">My Project</Link>,
      "/participant/project",
      <ProjectOutlined />,
    ),
  ];

  const juryItems: MenuItem[] = [
    getItem(
      <Link to="/jury/dashboard">Dashboard</Link>,
      "/jury/dashboard",
      <DashboardOutlined />,
    ),
    getItem(
      <Link to="/jury/projects">Projects to Rate</Link>,
      "/jury/projects",
      <AuditOutlined />,
    ),
    getItem(
      <Link to="/jury/results">Results</Link>,
      "/jury/results",
      <TrophyOutlined />,
    ),
  ];

  const organizerItems: MenuItem[] = [
    getItem(
      <Link to="/organizer/dashboard">Dashboard</Link>,
      "/organizer/dashboard",
      <DashboardOutlined />,
    ),
    getItem(
      <Link to="/organizer/event">Event Settings</Link>,
      "/organizer/event",
      <ScheduleOutlined />,
    ),
    getItem(
      <Link to="/organizer/users">Users</Link>,
      "/organizer/users",
      <UserSwitchOutlined />,
    ),
    getItem(
      <Link to="/organizer/projects">All Projects</Link>,
      "/organizer/projects",
      <ProjectOutlined />,
    ),
    getItem(
      <Link to="/organizer/settings">Settings</Link>,
      "/organizer/settings",
      <SettingOutlined />,
    ),
  ];

  switch (role) {
    case "participant":
      return participantItems;
    case "jury":
      return juryItems;
    case "organizer":
      return organizerItems;
    default:
      return [];
  }
};

const AppSider = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  const menuItems = useMemo(() => {
    if (!user?.role) return [];
    return getMenuItems(user.role);
  }, [user?.role]);

  // Find the most specific matching key for the current location.
  const selectedKey = menuItems
    .map((item) => item?.key)
    .filter((key) => location.pathname.startsWith(key as string))
    .sort((a, b) => (b as string).length - (a as string).length)[0]
    ?.toString();

  if (!user) {
    return null; // Don't render Sider if no user
  }

  return (
    <Sider width={200} breakpoint="lg" collapsedWidth="0">
      <Menu
        mode="inline"
        selectedKeys={selectedKey ? [selectedKey] : []}
        style={{ height: "100%", borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSider;
