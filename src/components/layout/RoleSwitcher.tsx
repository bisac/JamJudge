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
