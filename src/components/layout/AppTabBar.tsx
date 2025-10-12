import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TabBar } from "antd-mobile";
import {
  AppOutline,
  TeamOutline,
  FileOutline,
  ContentOutline,
  SystemQRcodeOutline,
  HistogramOutline,
  SendOutline,
} from "antd-mobile-icons";
import { useAuthContext } from "../../hooks/useAuthContext";
import type { UserRole } from "../../types";

interface TabItem {
  key: string;
  title: string;
  icon: React.ReactNode;
}

const getTabs = (role: UserRole): TabItem[] => {
  switch (role) {
    case "participant":
      return [
        {
          key: "/participant/dashboard",
          title: "Dashboard",
          icon: <AppOutline />,
        },
        { key: "/participant/team", title: "Team", icon: <TeamOutline /> },
        {
          key: "/participant/project",
          title: "Project",
          icon: <FileOutline />,
        },
      ];
    case "jury":
      return [
        { key: "/jury/dashboard", title: "Dashboard", icon: <AppOutline /> },
        { key: "/jury/projects", title: "Projects", icon: <ContentOutline /> },
        {
          key: "/jury/results",
          title: "Results",
          icon: <SystemQRcodeOutline />,
        },
      ];
    case "organizer":
      return [
        {
          key: "/organizer/dashboard",
          title: "Dashboard",
          icon: <AppOutline />,
        },
        { key: "/organizer/teams", title: "Teams", icon: <TeamOutline /> },
        {
          key: "/organizer/projects",
          title: "Projects",
          icon: <ContentOutline />,
        },
        {
          key: "/organizer/scores",
          title: "Scores",
          icon: <HistogramOutline />,
        },
        {
          key: "/organizer/publish",
          title: "Publish",
          icon: <SendOutline />,
        },
      ];
    default:
      return [];
  }
};

const AppTabBar = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = useMemo(() => {
    if (!user?.role) return [];
    return getTabs(user.role);
  }, [user?.role]);

  const activeKey =
    tabs.find((tab) => location.pathname.startsWith(tab.key))?.key || null;

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  if (!user) {
    return null;
  }

  return (
    <TabBar activeKey={activeKey} onChange={handleTabChange}>
      {tabs.map((item) => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
};

export default AppTabBar;
