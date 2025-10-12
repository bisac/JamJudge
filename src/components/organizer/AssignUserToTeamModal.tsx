import { useState, useEffect } from "react";
import { Modal, Form, Select, message } from "antd";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import type { UserProfileDTO, TeamDTO } from "../../types";

interface AssignUserToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, teamId: string) => Promise<void>;
  eventId: string | null;
}

interface AssignUserToTeamFormData {
  userId: string;
  teamId: string;
}

const AssignUserToTeamModal = ({
  isOpen,
  onClose,
  onSubmit,
  eventId,
}: AssignUserToTeamModalProps) => {
  const [form] = Form.useForm<AssignUserToTeamFormData>();
  const [users, setUsers] = useState<UserProfileDTO[]>([]);
  const [teams, setTeams] = useState<TeamDTO[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState("");

  // Fetch teams when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      fetchTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, eventId]);

  // Fetch users based on search
  useEffect(() => {
    if (isOpen && userSearchValue.length >= 2) {
      fetchUsers(userSearchValue);
    } else {
      setUsers([]);
    }
  }, [isOpen, userSearchValue]);

  const fetchTeams = async () => {
    if (!eventId) return;

    setIsLoadingTeams(true);
    try {
      const teamsCollection = collection(db, "teams");
      const q = query(teamsCollection, where("eventId", "==", eventId));
      const snapshot = await getDocs(q);
      const teamsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TeamDTO[];
      setTeams(teamsData);
    } catch (error) {
      console.error("Error fetching teams:", error);
      message.error("Failed to load teams");
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const fetchUsers = async (searchTerm: string) => {
    setIsLoadingUsers(true);
    try {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);

      // Filter users by email or displayName (client-side filtering)
      const usersData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserProfileDTO[];

      // Filter users by role (only participants can be assigned to teams)
      // and by search term (email or displayName)
      const filteredUsers = usersData.filter(
        (user) =>
          user.role === "participant" &&
          (user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase())),
      );

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to search users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      await onSubmit(values.userId, values.teamId);
      form.resetFields();
      setUserSearchValue("");
      setUsers([]);
    } catch (error) {
      console.error("Validation or submission error:", error);
      // If it's not a validation error, show error message
      if (
        error &&
        typeof error === "object" &&
        "errorFields" in error === false
      ) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to assign user to team";
        message.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setUserSearchValue("");
    setUsers([]);
    onClose();
  };

  return (
    <Modal
      title="Assign Participant to Team"
      open={isOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isSubmitting}
      okText="Assign"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical" name="assignUserToTeam">
        <Form.Item
          name="userId"
          label="Participant"
          rules={[{ required: true, message: "Please select a participant" }]}
        >
          <Select
            showSearch
            placeholder="Search participant by email or name"
            loading={isLoadingUsers}
            onSearch={setUserSearchValue}
            filterOption={false}
            notFoundContent={
              userSearchValue.length < 2
                ? "Type at least 2 characters to search"
                : isLoadingUsers
                  ? "Loading..."
                  : "No participants found"
            }
          >
            {users.map((user) => (
              <Select.Option key={user.uid} value={user.uid}>
                {user.displayName} ({user.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="teamId"
          label="Team"
          rules={[{ required: true, message: "Please select a team" }]}
        >
          <Select
            placeholder="Select a team"
            loading={isLoadingTeams}
            showSearch
            filterOption={(input, option) => {
              const label = option?.label || option?.children;
              if (typeof label === "string") {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            {teams.map((team) => (
              <Select.Option key={team.id} value={team.id}>
                {team.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignUserToTeamModal;
