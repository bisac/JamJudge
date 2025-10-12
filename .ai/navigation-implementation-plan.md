# Navigation Implementation Plan

## 1. Overview

This document provides a comprehensive, step-by-step implementation plan for completing the navigation system in JamJudge. It focuses on missing components and functionality needed to achieve full navigation coverage across all user roles.

**Current Status:**
- ✅ Basic navigation structure exists (AppSider, AppTabBar)
- ✅ All three roles have menu definitions
- ✅ Most routes are configured
- ⚠️  Role switching is placeholder only
- ⚠️  Some pages are missing
- ⚠️  Missing supporting components

**Goal:**
Complete a fully functional, role-aware navigation system that seamlessly supports users with single or multiple roles across desktop and mobile devices.

**Integration Note:**
This plan is independent but integrates with existing implementation plans:
- `auth-views-implementation-plan.md` - Login/signup flows
- `participant-project-form-view-implementation-plan.md` - Project pages
- `jury-views-implementation-plan.md` - Jury evaluation pages
- `organizer-*-implementation-plan.md` - Organizer pages
- `public-leaderboard-view-implementation-plan.md` - Public results

---

## 2. Scope & Deliverables

### In Scope
1. **RoleSwitcher Component** - Full implementation with role detection and switching
2. **Multi-Role Support** - Detect and manage users with multiple roles
3. **Missing Pages** - Settings pages and jury evaluation detail page
4. **Public Leaderboard** - Results page for unauthenticated users
5. **Navigation Guards** - Enhanced role checking and redirects
6. **Breadcrumbs** - Optional navigation breadcrumbs
7. **Integration Testing** - Navigation flow testing

### Out of Scope
- Individual page implementations (covered by other plans)
- Advanced features (notifications, search, FAB)
- Multi-language support (i18n)
- Analytics integration

---

## 3. Architecture & Components

### 3.1 Component Hierarchy

```
AppShell
├── AppHeader
│   ├── Logo
│   ├── RoleSwitcher (if hasMultipleRoles) ⚠️  NEEDS IMPLEMENTATION
│   └── UserProfileDropdown ✅
├── AppSider (Desktop) ✅ EXISTS, needs enhancement
│   └── Menu (role-based)
├── Content
│   ├── StageBar ✅
│   ├── Breadcrumbs ⚠️  TO CREATE
│   └── <Outlet /> (page content)
└── AppTabBar (Mobile) ✅ EXISTS
```

### 3.2 Context & State

```typescript
// Current: AuthContext
interface AuthContextType {
  user: UserProfileDTO | null;
  firebaseUser: User | null;
  isLoading: boolean;
  hasMultipleRoles: boolean; // ⚠️  Currently hardcoded to false
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// NEEDS: Active role context
interface NavigationContextType {
  activeRole: UserRole;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
}
```

### 3.3 Data Model

```typescript
// User with multiple roles support
interface UserProfileDTO {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole; // Primary role
  roles?: UserRole[]; // ⚠️  OPTIONAL: All assigned roles
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type UserRole = "participant" | "jury" | "organizer";

// Navigation state (localStorage)
interface NavigationState {
  activeRole: UserRole;
  lastVisitedPaths: Record<UserRole, string>; // Remember last page per role
}
```

---

## 4. Implementation Tasks

### TASK 1: Multi-Role Detection & Management

**Priority:** HIGH
**Estimated Effort:** 2-3 hours
**Dependencies:** None

#### Subtasks

##### 1.1 Update UserProfileDTO Type
**File:** `src/types.d.ts`

```typescript
export interface UserProfileDTO {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole; // Primary role
  roles?: UserRole[]; // Optional: all assigned roles
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

##### 1.2 Update AuthProvider - Detect Multiple Roles
**File:** `src/contexts/AuthProvider.tsx`

```typescript
// In AuthProvider component
const [userProfile, setUserProfile] = useState<UserProfileDTO | null>(null);

useEffect(() => {
  if (firebaseUser) {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const profile = {
          uid: docSnap.id,
          ...docSnap.data(),
        } as UserProfileDTO;
        
        setUserProfile(profile);
      }
    });
    return () => unsubscribeProfile();
  }
}, [firebaseUser]);

// Calculate hasMultipleRoles
const hasMultipleRoles = useMemo(() => {
  if (!userProfile) return false;
  
  // Option 1: If using roles array
  if (userProfile.roles && userProfile.roles.length > 1) {
    return true;
  }
  
  // Option 2: Check against a separate roles collection (future)
  // For MVP, we assume single role unless roles array exists
  return false;
}, [userProfile]);

const value: AuthContextType = {
  user: userProfile,
  firebaseUser,
  isLoading,
  hasMultipleRoles, // ✅ Now dynamic
  login,
  signUp,
  resetPassword,
  signOut,
};
```

**Testing:**
- [ ] User with single role → `hasMultipleRoles = false`
- [ ] User with multiple roles → `hasMultipleRoles = true`
- [ ] RoleSwitcher appears/disappears correctly

---

### TASK 2: RoleSwitcher Component - Full Implementation

**Priority:** HIGH
**Estimated Effort:** 4-5 hours
**Dependencies:** TASK 1

#### 2.1 Create Navigation Context
**File:** `src/contexts/NavigationContext.ts`

```typescript
import { createContext } from "react";
import type { UserRole } from "../types";

export interface NavigationContextType {
  activeRole: UserRole | null;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  getDefaultPath: (role: UserRole) => string;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);
```

#### 2.2 Create Navigation Provider
**File:** `src/contexts/NavigationProvider.tsx`

```typescript
import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { NavigationContext } from "./NavigationContext";
import type { UserRole } from "../types";

const NAVIGATION_STATE_KEY = "jamjudge_navigation_state";

interface NavigationState {
  activeRole: UserRole | null;
  lastVisitedPaths: Record<UserRole, string>;
}

const getDefaultPath = (role: UserRole): string => {
  switch (role) {
    case "participant":
      return "/participant/dashboard";
    case "jury":
      return "/jury/dashboard";
    case "organizer":
      return "/organizer/dashboard";
    default:
      return "/";
  }
};

const loadNavigationState = (): NavigationState => {
  try {
    const stored = localStorage.getItem(NAVIGATION_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load navigation state:", error);
  }
  
  return {
    activeRole: null,
    lastVisitedPaths: {
      participant: "/participant/dashboard",
      jury: "/jury/dashboard",
      organizer: "/organizer/dashboard",
    },
  };
};

const saveNavigationState = (state: NavigationState) => {
  try {
    localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save navigation state:", error);
  }
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [navState, setNavState] = useState<NavigationState>(loadNavigationState);

  // Determine available roles
  const availableRoles = useMemo((): UserRole[] => {
    if (!user) return [];
    
    // If user has roles array, use it
    if (user.roles && user.roles.length > 0) {
      return user.roles;
    }
    
    // Otherwise, use primary role
    return user.role ? [user.role] : [];
  }, [user]);

  // Determine active role
  const activeRole = useMemo(() => {
    if (!user) return null;
    
    // If we have a stored active role and it's in available roles, use it
    if (navState.activeRole && availableRoles.includes(navState.activeRole)) {
      return navState.activeRole;
    }
    
    // Otherwise, use primary role or first available
    return user.role || availableRoles[0] || null;
  }, [user, availableRoles, navState.activeRole]);

  // Update active role when user changes
  useEffect(() => {
    if (activeRole && activeRole !== navState.activeRole) {
      setNavState((prev) => {
        const newState = { ...prev, activeRole };
        saveNavigationState(newState);
        return newState;
      });
    }
  }, [activeRole, navState.activeRole]);

  // Switch role handler
  const switchRole = useCallback(
    (role: UserRole) => {
      if (!availableRoles.includes(role)) {
        console.warn(`Role ${role} not available for user`);
        return;
      }

      // Get target path (last visited or default)
      const targetPath = navState.lastVisitedPaths[role] || getDefaultPath(role);

      // Update state
      const newState: NavigationState = {
        ...navState,
        activeRole: role,
      };
      setNavState(newState);
      saveNavigationState(newState);

      // Navigate to target path
      navigate(targetPath);
    },
    [availableRoles, navState, navigate]
  );

  // Track current path for active role
  useEffect(() => {
    if (activeRole && window.location.pathname.startsWith(`/${activeRole}`)) {
      setNavState((prev) => {
        const newState = {
          ...prev,
          lastVisitedPaths: {
            ...prev.lastVisitedPaths,
            [activeRole]: window.location.pathname,
          },
        };
        saveNavigationState(newState);
        return newState;
      });
    }
  }, [activeRole, window.location.pathname]);

  const value = {
    activeRole,
    availableRoles,
    switchRole,
    getDefaultPath,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
```

#### 2.3 Create useNavigationContext Hook
**File:** `src/hooks/useNavigationContext.ts`

```typescript
import { useContext } from "react";
import { NavigationContext } from "../contexts/NavigationContext";
import type { NavigationContextType } from "../contexts/NavigationContext";

export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigationContext must be used within NavigationProvider");
  }
  return context;
};
```

#### 2.4 Update RoleSwitcher Component
**File:** `src/components/layout/RoleSwitcher.tsx`

```typescript
import React from "react";
import { Dropdown, Button, Space } from "antd";
import type { MenuProps } from "antd";
import { SwapOutlined, CheckOutlined } from "@ant-design/icons";
import { useNavigationContext } from "../../hooks/useNavigationContext";
import type { UserRole } from "../../types";

const roleLabels: Record<UserRole, string> = {
  participant: "Participant",
  jury: "Jury",
  organizer: "Organizer",
};

const roleColors: Record<UserRole, string> = {
  participant: "#1890ff", // Blue
  jury: "#52c41a", // Green
  organizer: "#fa8c16", // Orange
};

const RoleSwitcher: React.FC = () => {
  const { activeRole, availableRoles, switchRole } = useNavigationContext();

  if (!activeRole || availableRoles.length <= 1) {
    return null; // Don't render if single role
  }

  const menuItems: MenuProps["items"] = availableRoles.map((role) => ({
    key: role,
    label: (
      <Space>
        {role === activeRole && <CheckOutlined />}
        {roleLabels[role]}
      </Space>
    ),
    onClick: () => switchRole(role),
  }));

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button
        type="text"
        icon={<SwapOutlined />}
        style={{
          color: "white",
          borderColor: roleColors[activeRole],
        }}
      >
        {roleLabels[activeRole]}
      </Button>
    </Dropdown>
  );
};

export default RoleSwitcher;
```

#### 2.5 Integrate NavigationProvider in App
**File:** `src/main.tsx` or `src/App.tsx`

```typescript
import { NavigationProvider } from "./contexts/NavigationProvider";

// Wrap router with NavigationProvider
<AuthProvider>
  <Router>
    <NavigationProvider>
      <Routes>
        {/* ... */}
      </Routes>
    </NavigationProvider>
  </Router>
</AuthProvider>
```

**Testing:**
- [ ] Dropdown shows all available roles
- [ ] Active role is highlighted with checkmark
- [ ] Clicking role switches navigation
- [ ] URL changes to target role's dashboard
- [ ] Last visited page is remembered per role
- [ ] State persists across page refreshes

---

### TASK 3: Missing Pages Implementation

**Priority:** HIGH
**Estimated Effort:** 6-8 hours
**Dependencies:** None (can be done in parallel)

#### 3.1 Settings Pages (All Roles)

##### Participant Settings Page
**File:** `src/pages/participant/SettingsPage.tsx`

```typescript
import React, { useState } from "react";
import { Form, Input, Button, Avatar, Upload, message, Card } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuthContext } from "../../hooks/useAuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ParticipantSettingsPage: React.FC = () => {
  const { user } = useAuthContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: values.displayName,
        updatedAt: new Date(),
      });
      message.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      message.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Settings" style={{ maxWidth: 600 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Avatar size={80} icon={<UserOutlined />} src={user?.photoURL} />
        <div style={{ marginTop: 8 }}>
          <Upload>
            <Button icon={<UploadOutlined />}>Change Photo</Button>
          </Upload>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          email: user?.email,
          displayName: user?.displayName,
        }}
        onFinish={onFinish}
      >
        <Form.Item label="Email">
          <Input disabled value={user?.email} />
        </Form.Item>

        <Form.Item
          label="Display Name"
          name="displayName"
          rules={[{ required: true, message: "Display name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ParticipantSettingsPage;
```

##### Jury Settings Page
**File:** `src/pages/jury/SettingsPage.tsx`

Similar to participant, with emphasis on displayName requirement.

##### Organizer Settings Page
**File:** `src/pages/organizer/SettingsPage.tsx`

Similar structure, possibly with additional system preferences.

#### 3.2 Add Settings Routes
**File:** `src/routing/Router.tsx`

```typescript
// Participant routes
{
  path: "participant",
  children: [
    // ... existing routes
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

// Jury routes
{
  path: "jury",
  children: [
    // ... existing routes
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

// Organizer routes
{
  path: "organizer",
  children: [
    // ... existing routes
    {
      path: "settings",
      element: (
        <Suspense fallback={SuspenseFallback}>
          <OrganizerSettingsPage />
        </Suspense>
      ),
    },
  ],
},
```

**Testing:**
- [ ] Settings page loads for each role
- [ ] Form displays current user data
- [ ] Form submission updates Firestore
- [ ] Success/error messages display
- [ ] Navigation to settings works from menu

---

### TASK 4: Jury Evaluation Detail Page

**Priority:** HIGH
**Estimated Effort:** 4-6 hours (if not covered by jury-views-implementation-plan.md)
**Dependencies:** Criteria configuration, project data

**Note:** This is detailed in `jury-views-implementation-plan.md`. Here we focus on navigation integration.

#### 4.1 Add Route
**File:** `src/routing/Router.tsx`

```typescript
{
  path: "jury",
  children: [
    // ... existing routes
    {
      path: "projects/:projectId",
      element: (
        <Suspense fallback={SuspenseFallback}>
          <ProjectEvaluationPage />
        </Suspense>
      ),
    },
  ],
},
```

#### 4.2 Navigation from Projects List
**File:** `src/pages/jury/ProjectsToRatePage.tsx`

Ensure each project card/row has a link:
```typescript
<Link to={`/jury/projects/${project.id}`}>View & Rate</Link>
```

**Testing:**
- [ ] Clicking project navigates to evaluation page
- [ ] URL contains projectId
- [ ] Back button returns to projects list
- [ ] Breadcrumb shows: Jury > Projects > [Project Name]

---

### TASK 5: Public Leaderboard Page

**Priority:** HIGH
**Estimated Effort:** 4-5 hours
**Dependencies:** publishResults function must denormalize data

**Note:** Detailed in `public-leaderboard-view-implementation-plan.md`. Here we focus on routing and navigation.

#### 5.1 Create Page
**File:** `src/pages/public/LeaderboardPage.tsx`

```typescript
import React from "react";
import { useEventContext } from "../../hooks/useEventContext";
import { Result, Spin } from "antd";
import LeaderboardTable from "../../components/public/LeaderboardTable";

const LeaderboardPage: React.FC = () => {
  const { event, isLoading } = useEventContext();

  if (isLoading) {
    return <Spin size="large" />;
  }

  if (!event?.resultsPublishedAt) {
    return (
      <Result
        status="info"
        title="Results Not Yet Published"
        subTitle="The event results will be available here once the organizer publishes them."
      />
    );
  }

  return (
    <div>
      <h1>{event.name} - Results</h1>
      <LeaderboardTable eventId={event.id} />
    </div>
  );
};

export default LeaderboardPage;
```

#### 5.2 Add Public Route
**File:** `src/routing/Router.tsx`

```typescript
{
  path: "/leaderboard",
  element: (
    <Suspense fallback={SuspenseFallback}>
      <LeaderboardPage />
    </Suspense>
  ),
},
```

#### 5.3 Add Link in Landing Page
**File:** `src/pages/public/LandingPage.tsx`

```typescript
{event?.resultsPublishedAt && (
  <Button type="primary" size="large">
    <Link to="/leaderboard">View Results</Link>
  </Button>
)}
```

#### 5.4 Add to Authenticated User Menus
Already added in AppSider and AppTabBar for participant and jury roles.

**Testing:**
- [ ] Page accessible without authentication
- [ ] Shows "not published" message before publication
- [ ] Shows leaderboard after publication
- [ ] Link appears on landing page when appropriate
- [ ] Accessible from participant/jury menus

---

### TASK 6: Breadcrumbs Component (Optional, MEDIUM priority)

**Priority:** MEDIUM
**Estimated Effort:** 2-3 hours
**Dependencies:** None

#### 6.1 Create Breadcrumbs Component
**File:** `src/components/layout/AppBreadcrumb.tsx`

```typescript
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";

interface BreadcrumbConfig {
  [key: string]: string;
}

const breadcrumbNameMap: BreadcrumbConfig = {
  "/participant": "Participant",
  "/participant/dashboard": "Dashboard",
  "/participant/team": "My Team",
  "/participant/project": "My Project",
  "/participant/settings": "Settings",
  
  "/jury": "Jury",
  "/jury/dashboard": "Dashboard",
  "/jury/projects": "Projects to Rate",
  "/jury/results": "My Evaluations",
  "/jury/settings": "Settings",
  
  "/organizer": "Organizer",
  "/organizer/dashboard": "Dashboard",
  "/organizer/event": "Event Settings",
  "/organizer/criteria": "Criteria",
  "/organizer/teams": "Teams",
  "/organizer/projects": "Projects",
  "/organizer/users": "Users",
  "/organizer/scores": "Scores Preview",
  "/organizer/publish": "Publish Results",
  "/organizer/audits": "Audit Log",
  "/organizer/storage": "Storage Monitor",
  "/organizer/settings": "Settings",
};

const AppBreadcrumb: React.FC = () => {
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const label = breadcrumbNameMap[url] || url;
      
      return {
        key: url,
        title: index === pathSnippets.length - 1 ? (
          label
        ) : (
          <Link to={url}>{label}</Link>
        ),
      };
    });

    const breadcrumbItems = [
      {
        key: "home",
        title: (
          <Link to="/">
            <HomeOutlined />
          </Link>
        ),
      },
      ...extraBreadcrumbItems,
    ];

    return breadcrumbItems;
  }, [location]);

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb on home page
  }

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ margin: "16px 0" }}
    />
  );
};

export default AppBreadcrumb;
```

#### 6.2 Integrate in AppShell
**File:** `src/components/layout/AppShell.tsx`

```typescript
import AppBreadcrumb from "./AppBreadcrumb";

// In Content section
<Content>
  <StageBar />
  {isDesktop && <AppBreadcrumb />}
  <Outlet />
</Content>
```

**Testing:**
- [ ] Breadcrumbs display on subpages
- [ ] Links in breadcrumbs work
- [ ] Current page is not a link
- [ ] Only shows on desktop
- [ ] Hidden on top-level pages

---

### TASK 7: Enhanced Navigation Guards

**Priority:** MEDIUM
**Estimated Effort:** 2-3 hours
**Dependencies:** TASK 2

#### 7.1 Update RequireAuth Guard
**File:** `src/routing/RequireAuth.tsx`

Add check for active role and redirect appropriately:

```typescript
import { useNavigationContext } from "../hooks/useNavigationContext";

const RequireAuth: React.FC = () => {
  const { user, isLoading } = useAuthContext();
  const { activeRole, getDefaultPath } = useNavigationContext();
  const location = useLocation();

  if (isLoading) {
    return <Spin size="large" />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user is accessing correct role section
  const currentPath = location.pathname;
  const isOnRolePath = activeRole && currentPath.startsWith(`/${activeRole}`);
  
  // If on root or wrong role path, redirect to default path for active role
  if (!isOnRolePath && activeRole) {
    return <Navigate to={getDefaultPath(activeRole)} replace />;
  }

  return <Outlet />;
};
```

#### 7.2 Create PendingActivationPage
**File:** `src/pages/auth/PendingActivationPage.tsx`

For users who have Firebase Auth account but no Firestore profile or role:

```typescript
import React from "react";
import { Result, Button } from "antd";
import { useAuthContext } from "../../hooks/useAuthContext";

const PendingActivationPage: React.FC = () => {
  const { signOut } = useAuthContext();

  return (
    <Result
      status="info"
      title="Account Pending Activation"
      subTitle="Your account has been created but is pending role assignment by an organizer. You will receive an email once your account is activated."
      extra={[
        <Button key="logout" onClick={signOut}>
          Logout
        </Button>,
      ]}
    />
  );
};

export default PendingActivationPage;
```

---

### TASK 8: Integration & Testing

**Priority:** HIGH
**Estimated Effort:** 3-4 hours
**Dependencies:** All previous tasks

#### 8.1 Test Scenarios

##### Single Role User
- [ ] Login as participant
  - [ ] Redirects to /participant/dashboard
  - [ ] Participant menu shows in sider
  - [ ] Participant tabs show in mobile
  - [ ] No RoleSwitcher in header
  - [ ] Can access all participant pages
  - [ ] Cannot access jury/organizer pages (403)

- [ ] Login as jury
  - [ ] Redirects to /jury/dashboard
  - [ ] Jury menu shows in sider
  - [ ] Jury tabs show in mobile
  - [ ] No RoleSwitcher in header
  - [ ] Can access all jury pages
  - [ ] Can evaluate projects

- [ ] Login as organizer
  - [ ] Redirects to /organizer/dashboard
  - [ ] Organizer menu shows in sider
  - [ ] Organizer submenu expands correctly
  - [ ] Organizer tabs show in mobile
  - [ ] Can access all organizer pages

##### Multi-Role User
- [ ] Login as user with participant + jury roles
  - [ ] RoleSwitcher appears in header
  - [ ] Shows both roles in dropdown
  - [ ] Active role is checked
  - [ ] Switching from participant to jury:
    - [ ] Navigation changes to jury menu
    - [ ] Redirects to /jury/dashboard
    - [ ] State persists on page reload
  - [ ] Switching back to participant:
    - [ ] Returns to last visited participant page
    - [ ] Menu updates correctly

##### Public User
- [ ] Access leaderboard before publication
  - [ ] Shows "not published" message
- [ ] Access leaderboard after publication
  - [ ] Shows results table
- [ ] Attempt to access protected routes
  - [ ] Redirects to /auth/login

##### Responsive Behavior
- [ ] Desktop (≥768px)
  - [ ] Sider visible
  - [ ] Tab bar hidden
  - [ ] Breadcrumbs visible
- [ ] Mobile (<768px)
  - [ ] Sider hidden
  - [ ] Tab bar visible at bottom
  - [ ] Breadcrumbs hidden

#### 8.2 Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

#### 8.3 Performance Testing
- [ ] Initial load time acceptable (<3s)
- [ ] Navigation transitions smooth
- [ ] No memory leaks on role switching
- [ ] LocalStorage usage within limits

---

## 5. Implementation Sequence

### Phase 1: Core Navigation (Week 1)
1. ✅ TASK 1: Multi-Role Detection (Day 1)
2. ✅ TASK 2: RoleSwitcher Implementation (Day 2-3)
3. ✅ TASK 7: Enhanced Guards (Day 4)
4. ✅ Testing Phase 1 (Day 5)

### Phase 2: Missing Pages (Week 2)
1. ✅ TASK 3.1: Settings Pages (Day 1-2)
2. ✅ TASK 4: Jury Evaluation Page (Day 3-4)
3. ✅ TASK 5: Public Leaderboard (Day 5)

### Phase 3: Polish & Testing (Week 3)
1. ⚠️  TASK 6: Breadcrumbs (Optional, Day 1)
2. ✅ TASK 8: Integration Testing (Day 2-5)
3. Bug fixes and refinements

---

## 6. Integration Points with Other Plans

### Integration with auth-views-implementation-plan.md
- **Point:** Login/SignUp flow
- **Integration:** After successful login, use NavigationContext to determine redirect target
- **File:** `src/pages/auth/LoginPage.tsx`

### Integration with participant-project-form-view-implementation-plan.md
- **Point:** Navigation to project page
- **Integration:** Ensure navigation from dashboard works correctly
- **File:** `src/pages/participant/ParticipantDashboard.tsx`

### Integration with jury-views-implementation-plan.md
- **Point:** Projects list → Evaluation page
- **Integration:** Use React Router Link with projectId param
- **File:** `src/pages/jury/ProjectsToRatePage.tsx`

### Integration with organizer-*-implementation-plan.md
- **Point:** All organizer pages
- **Integration:** Already integrated via AppSider submenu
- **Status:** ✅ Complete

### Integration with public-leaderboard-view-implementation-plan.md
- **Point:** Public results page
- **Integration:** Route configuration and conditional rendering
- **File:** `src/pages/public/LeaderboardPage.tsx`

---

## 7. Technical Considerations

### State Management
- **Approach:** Context API for navigation state
- **Rationale:** Simple, built-in, sufficient for navigation needs
- **Alternative:** Could use Zustand/Redux if needed for complex state

### Routing
- **Library:** React Router v6
- **Pattern:** Lazy loading with Suspense for code splitting
- **Guards:** Wrapper components for authentication/authorization

### Performance
- **Memoization:** Use useMemo/useCallback for expensive operations
- **Code Splitting:** Lazy load pages per role
- **Bundle Size:** Monitor chunk sizes, aim for <250KB per chunk

### Accessibility
- **Keyboard Nav:** All menu items accessible via Tab/Arrow keys
- **Screen Readers:** ARIA labels on all navigation elements
- **Focus Management:** Proper focus states on navigation

### Error Handling
- **Network Errors:** Handle offline state with OfflineBanner
- **Auth Errors:** Clear error messages on login/redirect
- **Missing Data:** Graceful fallbacks for undefined user/role

---

## 8. Testing Strategy

### Unit Tests
```typescript
// Example: RoleSwitcher.test.tsx
describe("RoleSwitcher", () => {
  it("renders dropdown with available roles", () => {
    // Test implementation
  });

  it("highlights active role", () => {
    // Test implementation
  });

  it("calls switchRole on role selection", () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// Example: navigation-flow.test.tsx
describe("Multi-role navigation flow", () => {
  it("switches from participant to jury role", async () => {
    // 1. Login as multi-role user
    // 2. Verify participant menu visible
    // 3. Click role switcher
    // 4. Select jury
    // 5. Verify navigation to jury dashboard
    // 6. Verify jury menu visible
  });
});
```

### E2E Tests (Playwright/Cypress)
```typescript
// Example: e2e/navigation.spec.ts
test("multi-role user can switch between roles", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "multi@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('[type="submit"]');
  
  await page.waitForURL("/participant/dashboard");
  await page.click('[data-testid="role-switcher"]');
  await page.click('text=Jury');
  
  await page.waitForURL("/jury/dashboard");
  expect(await page.textContent("h1")).toContain("Jury Dashboard");
});
```

---

## 9. Rollout Plan

### Development Environment
1. Implement all tasks in feature branch
2. Run unit tests
3. Manual testing in dev environment
4. Code review

### Staging Environment
1. Deploy to staging
2. Run integration tests
3. E2E test suite
4. User acceptance testing (UAT)

### Production Environment
1. Feature flag for multi-role support (if needed)
2. Gradual rollout (10% → 50% → 100%)
3. Monitor error rates and performance
4. Rollback plan ready

---

## 10. Success Criteria

### Functional
- [ ] All users can navigate within their role section
- [ ] Multi-role users can switch between roles seamlessly
- [ ] Public users can access leaderboard after publication
- [ ] All menu items work on desktop and mobile
- [ ] Navigation state persists across page reloads

### Non-Functional
- [ ] Navigation response time <100ms
- [ ] No console errors in browser
- [ ] 100% keyboard accessible
- [ ] WCAG AA compliant
- [ ] Works on all major browsers

### User Experience
- [ ] Clear visual indication of active role
- [ ] Intuitive role switching (1-2 clicks)
- [ ] No broken links or 404 pages
- [ ] Smooth transitions between pages
- [ ] Responsive on all device sizes

---

## 11. Risks & Mitigation

### Risk 1: Multiple Roles Complexity
**Impact:** High
**Likelihood:** Medium
**Mitigation:**
- Start with single role, add multi-role as enhancement
- Clear documentation of role switching logic
- Extensive testing of edge cases

### Risk 2: State Synchronization
**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**
- Use single source of truth (NavigationContext)
- Clear state update patterns
- Avoid race conditions with proper useEffect dependencies

### Risk 3: Performance Issues
**Impact:** Low
**Likelihood:** Low
**Mitigation:**
- Memoize expensive calculations
- Lazy load pages
- Monitor bundle sizes

### Risk 4: Browser Compatibility
**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Test on all major browsers
- Use polyfills if needed
- Provide fallbacks for unsupported features

---

## 12. Maintenance & Future Enhancements

### Maintenance Tasks
- [ ] Monitor navigation-related error rates
- [ ] Update breadcrumb map when adding new pages
- [ ] Keep role switcher logic simple and tested
- [ ] Document any navigation patterns for future developers

### Future Enhancements
1. **Notifications & Badges**
   - Show badge count on menu items
   - Real-time notifications

2. **Quick Navigation (Cmd+K)**
   - Command palette for power users
   - Search functionality

3. **Favorites/Bookmarks**
   - Allow users to bookmark frequently used pages
   - Quick access menu

4. **Multi-language Support**
   - i18n for all navigation labels
   - Language switcher

5. **Analytics Integration**
   - Track navigation patterns
   - Identify unused pages
   - Optimize menu structure based on usage

---

## 13. Documentation

### Developer Documentation
- [ ] Update README with navigation architecture
- [ ] Document NavigationContext API
- [ ] Add examples for common navigation scenarios
- [ ] Create troubleshooting guide

### User Documentation
- [ ] Help articles for role switching
- [ ] Video tutorial for navigation
- [ ] FAQ section

---

## 14. Appendix

### A. File Structure
```
src/
├── components/
│   └── layout/
│       ├── AppHeader.tsx              ✅ Update
│       ├── AppShell.tsx               ✅ Exists
│       ├── AppSider.tsx               ✅ Exists
│       ├── AppTabBar.tsx              ✅ Exists
│       ├── AppBreadcrumb.tsx          ⚠️  Create
│       ├── RoleSwitcher.tsx           ⚠️  Implement
│       ├── StageBar.tsx               ✅ Exists
│       └── OfflineBanner.tsx          ✅ Exists
├── contexts/
│   ├── NavigationContext.ts           ⚠️  Create
│   └── NavigationProvider.tsx         ⚠️  Create
├── hooks/
│   └── useNavigationContext.ts        ⚠️  Create
├── pages/
│   ├── public/
│   │   └── LeaderboardPage.tsx        ⚠️  Create
│   ├── participant/
│   │   └── SettingsPage.tsx           ⚠️  Create
│   ├── jury/
│   │   ├── ProjectEvaluationPage.tsx  ⚠️  Create/Verify
│   │   └── SettingsPage.tsx           ⚠️  Create
│   └── organizer/
│       └── SettingsPage.tsx           ⚠️  Create
└── routing/
    ├── Router.tsx                     ✅ Update
    └── RequireAuth.tsx                ⚠️  Enhance
```

### B. Dependencies
```json
{
  "dependencies": {
    "react-router-dom": "^6.x",
    "antd": "^5.x",
    "antd-mobile": "^5.x",
    "@ant-design/icons": "^5.x",
    "firebase": "^10.x"
  }
}
```

### C. Key Constants
```typescript
// Navigation paths
export const NAVIGATION_PATHS = {
  participant: {
    dashboard: "/participant/dashboard",
    team: "/participant/team",
    project: "/participant/project",
    settings: "/participant/settings",
  },
  jury: {
    dashboard: "/jury/dashboard",
    projects: "/jury/projects",
    results: "/jury/results",
    settings: "/jury/settings",
  },
  organizer: {
    dashboard: "/organizer/dashboard",
    event: "/organizer/event",
    criteria: "/organizer/criteria",
    teams: "/organizer/teams",
    projects: "/organizer/projects",
    users: "/organizer/users",
    scores: "/organizer/scores",
    publish: "/organizer/publish",
    audits: "/organizer/audits",
    storage: "/organizer/storage",
    settings: "/organizer/settings",
  },
} as const;
```

---

## Summary

This implementation plan provides a comprehensive, step-by-step approach to completing the navigation system for JamJudge. It integrates with existing implementation plans while focusing specifically on navigation concerns.

**Estimated Total Effort:** 20-30 hours
**Recommended Timeline:** 2-3 weeks
**Priority Tasks:** TASK 1, 2, 3, 4, 5

Once implemented, the navigation system will provide:
- ✅ Seamless role-based navigation
- ✅ Multi-role user support
- ✅ Complete page coverage
- ✅ Responsive design
- ✅ Accessible navigation
- ✅ Persistent state
- ✅ Integration with all features

**Ready for implementation!** 🚀

