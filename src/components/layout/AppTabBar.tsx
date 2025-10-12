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
  SetOutline,
  StarOutline,
} from "antd-mobile-icons";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useEventContext } from "../../hooks/useEventContext";
import type { UserRole } from "../../types";

interface TabItem {
  key: string;
  title: string;
  icon: React.ReactNode;
}

const getTabs = (role: UserRole, showLeaderboard: boolean): TabItem[] => {
  switch (role) {
    case "participant":
      return [
        {
          key: "/participant/dashboard",
          title: "Home",
          icon: <AppOutline />,
        },
        { key: "/participant/team", title: "Team", icon: <TeamOutline /> },
        {
          key: "/participant/project",
          title: "Project",
          icon: <FileOutline />,
        },
        ...(showLeaderboard
          ? [{ key: "/leaderboard", title: "Board", icon: <StarOutline /> }]
          : []),
        {
          key: "/participant/settings",
          title: "Settings",
          icon: <SetOutline />,
        },
      ];
    case "jury":
      return [
        { key: "/jury/dashboard", title: "Home", icon: <AppOutline /> },
        { key: "/jury/projects", title: "Projects", icon: <ContentOutline /> },
        {
          key: "/jury/results",
          title: "Evals",
          icon: <SystemQRcodeOutline />,
        },
        ...(showLeaderboard
          ? [{ key: "/leaderboard", title: "Board", icon: <StarOutline /> }]
          : []),
        {
          key: "/jury/settings",
          title: "Settings",
          icon: <SetOutline />,
        },
      ];
    case "organizer":
      return [
        {
          key: "/organizer/dashboard",
          title: "Dash",
          icon: <AppOutline />,
        },
        { key: "/organizer/teams", title: "Teams", icon: <TeamOutline /> },
        {
          key: "/organizer/projects",
          title: "Proj",
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
  const { event } = useEventContext();
  const location = useLocation();
  const navigate = useNavigate();

  const showLeaderboard = !!(event && event.resultsPublishedAt);

  const tabs = useMemo(() => {
    if (!user?.role) return [];
    return getTabs(user.role, showLeaderboard);
  }, [user?.role, showLeaderboard]);

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
