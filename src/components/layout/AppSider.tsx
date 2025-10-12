import React, { useMemo, useState, useEffect, useRef } from "react";
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
  StarOutlined,
  BarChartOutlined,
  RocketOutlined,
  FileSearchOutlined,
  CloudServerOutlined,
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
    getItem(
      <Link to="/participant/settings">Settings</Link>,
      "/participant/settings",
      <SettingOutlined />,
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
    getItem(
      <Link to="/jury/settings">Settings</Link>,
      "/jury/settings",
      <SettingOutlined />,
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
      <Link to="/organizer/criteria">Criteria</Link>,
      "/organizer/criteria",
      <StarOutlined />,
    ),
    getItem(
      <Link to="/organizer/teams">Teams</Link>,
      "/organizer/teams",
      <TeamOutlined />,
    ),
    getItem(
      <Link to="/organizer/projects">Projects</Link>,
      "/organizer/projects",
      <ProjectOutlined />,
    ),
    getItem(
      <Link to="/organizer/users">Users</Link>,
      "/organizer/users",
      <UserSwitchOutlined />,
    ),
    getItem("Results & Finalization", "finalization", <TrophyOutlined />, [
      getItem(
        <Link to="/organizer/scores">Scores Preview</Link>,
        "/organizer/scores",
        <BarChartOutlined />,
      ),
      getItem(
        <Link to="/organizer/publish">Publish Results</Link>,
        "/organizer/publish",
        <RocketOutlined />,
      ),
      getItem(
        <Link to="/organizer/audits">Audit Log</Link>,
        "/organizer/audits",
        <FileSearchOutlined />,
      ),
      getItem(
        <Link to="/organizer/storage">Storage Monitor</Link>,
        "/organizer/storage",
        <CloudServerOutlined />,
      ),
    ]),
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

  // Flatten all menu items including children for selectedKey calculation
  const flattenedItems = useMemo(() => {
    const flatten = (items: MenuItem[]): string[] => {
      return items.flatMap((item) => {
        if (!item) return [];
        const keys: string[] = [item.key as string];
        if ("children" in item && item.children) {
          keys.push(...flatten(item.children as MenuItem[]));
        }
        return keys;
      });
    };
    return flatten(menuItems);
  }, [menuItems]);

  // Find the most specific matching key for the current location.
  const selectedKey = flattenedItems
    .filter((key) => location.pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  // Determine if current path is in finalization section
  const isInFinalizationSection = useMemo(() => {
    return (
      location.pathname.startsWith("/organizer/scores") ||
      location.pathname.startsWith("/organizer/publish") ||
      location.pathname.startsWith("/organizer/audits") ||
      location.pathname.startsWith("/organizer/storage")
    );
  }, [location.pathname]);

  // Track previous path to detect navigation changes
  const prevPathRef = useRef(location.pathname);

  // State for controlling which submenus are open (user can interact)
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    return isInFinalizationSection ? ["finalization"] : [];
  });

  // Update open keys ONLY when navigating TO finalization section from elsewhere
  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    // Check if we just navigated to finalization section
    const wasInFinalization =
      prevPath.startsWith("/organizer/scores") ||
      prevPath.startsWith("/organizer/publish") ||
      prevPath.startsWith("/organizer/audits") ||
      prevPath.startsWith("/organizer/storage");

    // Only auto-open if we navigated FROM outside TO inside finalization
    if (isInFinalizationSection && !wasInFinalization) {
      setOpenKeys((prev) => {
        if (!prev.includes("finalization")) {
          return [...prev, "finalization"];
        }
        return prev;
      });
    }

    // Update ref for next comparison
    prevPathRef.current = currentPath;
  }, [location.pathname, isInFinalizationSection]);

  // Handle submenu open/close
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  if (!user) {
    return null; // Don't render Sider if no user
  }

  return (
    <Sider width={200} breakpoint="lg" collapsedWidth="0">
      <Menu
        mode="inline"
        selectedKeys={selectedKey ? [selectedKey] : []}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        style={{ height: "100%", borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSider;
