import React from "react";
import { Outlet } from "react-router-dom";
import { Layout, Spin, Result } from "antd";
import { EventContextProvider } from "../../contexts/EventContextProvider";
import { useEventContext } from "../../hooks/useEventContext";
import AppHeader from "./AppHeader";
import AppSider from "./AppSider";
import AppTabBar from "./AppTabBar";
import useMediaQuery from "../../hooks/useMediaQuery";
import StageBar from "./StageBar";
import OfflineBanner from "./OfflineBanner";

const { Content } = Layout;

const AppShellContent: React.FC = () => {
  const { isLoading, error, event } = useEventContext();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <Result
        status="500"
        title="Application Unavailable"
        subTitle={
          error?.message ||
          "Could not load essential event data. Please try again later."
        }
      />
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
        {isDesktop && <AppSider />}
        <Layout style={{ padding: "0 24px 24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: "#fff",
            }}
          >
            <StageBar />
            {/* Breadcrumb will be added here */}
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      {!isDesktop && (
        <div
          style={{ position: "fixed", bottom: 0, width: "100%", zIndex: 100 }}
        >
          <AppTabBar />
        </div>
      )}
      <OfflineBanner />
    </Layout>
  );
};

const AppShell = () => {
  return (
    <EventContextProvider>
      <AppShellContent />
    </EventContextProvider>
  );
};

export default AppShell;
