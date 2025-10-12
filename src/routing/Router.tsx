import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import RequireAuth from "./RequireAuth";
import RedirectIfAuthenticated from "./RedirectIfAuthenticated";
import JurySectionGuard from "./JurySectionGuard";
import { NavigationProvider } from "../contexts/NavigationProvider";
import { Spin } from "antd";

// A reusable fallback component for Suspense
const SuspenseFallback = (
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

// Wrapper component for NavigationProvider
const NavigationWrapper = () => {
  return (
    <NavigationProvider>
      <Outlet />
    </NavigationProvider>
  );
};

// Public and Auth pages
const LandingPage = lazy(() => import("../pages/public/LandingPage"));
const LeaderboardPage = lazy(() => import("../pages/public/LeaderboardPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("../pages/auth/SignUpPage"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));

// Layout for auth pages
import AuthLayout from "../components/layout/AuthLayout";

// Participant pages
const ParticipantDashboard = lazy(
  () => import("../pages/participant/ParticipantDashboard"),
);
const TeamPage = lazy(() => import("../pages/participant/TeamPage"));
const ProjectPage = lazy(() => import("../pages/participant/ProjectPage"));
const ParticipantSettingsPage = lazy(
  () => import("../pages/participant/SettingsPage"),
);

// Jury pages
const JuryDashboard = lazy(() => import("../pages/jury/JuryDashboard"));
const ProjectsToRatePage = lazy(
  () => import("../pages/jury/ProjectsToRatePage"),
);
const ResultsPage = lazy(() => import("../pages/jury/ResultsPage"));
const JurySettingsPage = lazy(() => import("../pages/jury/SettingsPage"));
const ProjectEvaluationPage = lazy(
  () => import("../pages/jury/ProjectEvaluationPage"),
);

// Organizer pages
const OrganizerDashboard = lazy(
  () => import("../pages/organizer/OrganizerDashboard"),
);
const EventSettingsPage = lazy(
  () => import("../pages/organizer/EventSettingsPage"),
);
const UsersPage = lazy(() => import("../pages/organizer/UsersPage"));
const TeamsManagementPage = lazy(
  () => import("../pages/organizer/TeamsManagementPage"),
);
const ProjectsManagementPage = lazy(
  () => import("../pages/organizer/ProjectsManagementPage"),
);
const SettingsPage = lazy(() => import("../pages/organizer/SettingsPage"));
const CriteriaConfigPage = lazy(
  () => import("../pages/organizer/CriteriaConfigPage"),
);
const ScoresPreviewPage = lazy(
  () => import("../pages/organizer/ScoresPreviewPage"),
);
const PublishPage = lazy(() => import("../pages/organizer/PublishPage"));
const AuditLogPage = lazy(() => import("../pages/organizer/AuditLogPage"));
const StorageMonitoringPage = lazy(
  () => import("../pages/organizer/StorageMonitoringPage"),
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={SuspenseFallback}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: "/leaderboard",
    element: (
      <Suspense fallback={SuspenseFallback}>
        <LeaderboardPage />
      </Suspense>
    ),
  },
  {
    path: "/auth",
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: (
              <Suspense fallback={SuspenseFallback}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: "sign-up",
            element: (
              <Suspense fallback={SuspenseFallback}>
                <SignUpPage />
              </Suspense>
            ),
          },
          {
            path: "reset",
            element: (
              <Suspense fallback={SuspenseFallback}>
                <ResetPasswordPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    element: <NavigationWrapper />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                path: "participant",
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  {
                    path: "dashboard",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <ParticipantDashboard />
                      </Suspense>
                    ),
                  },
                  {
                    path: "team",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <TeamPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "project",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <ProjectPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "settings",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <ParticipantSettingsPage />
                      </Suspense>
                    ),
                  },
                ],
              },
              {
                path: "jury",
                element: <JurySectionGuard />,
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  {
                    path: "dashboard",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <JuryDashboard />
                      </Suspense>
                    ),
                  },
                  {
                    path: "projects",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <ProjectsToRatePage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "projects/:projectId",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <ProjectEvaluationPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "results",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <ResultsPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "settings",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <JurySettingsPage />
                      </Suspense>
                    ),
                  },
                ],
              },
              {
                path: "organizer",
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  {
                    path: "dashboard",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <OrganizerDashboard />
                      </Suspense>
                    ),
                  },
                  {
                    path: "event",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <EventSettingsPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "criteria",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <CriteriaConfigPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "users",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <UsersPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "teams",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <TeamsManagementPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "projects",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <ProjectsManagementPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "settings",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <SettingsPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "scores",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <ScoresPreviewPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "publish",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <PublishPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "audits",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <AuditLogPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: "storage",
                    element: (
                      <Suspense fallback={SuspenseFallback}>
                        <StorageMonitoringPage />
                      </Suspense>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />, // Fallback for unmatched routes
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
