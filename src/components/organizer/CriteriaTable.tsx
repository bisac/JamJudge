import { Table, Button, Popconfirm, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { CriterionDTO } from "../../types";

interface CriteriaTableProps {
  criteria: CriterionDTO[];
  onEdit: (criterion: CriterionDTO) => void;
  onDelete: (id: string) => void;
  isLocked: boolean;
  isLoading?: boolean;
}

const CriteriaTable = ({
  criteria,
  onEdit,
  onDelete,
  isLocked,
  isLoading = false,
}: CriteriaTableProps) => {
  const columns: ColumnsType<CriterionDTO> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      sorter: (a, b) => a.weight - b.weight,
      render: (weight: number) => <Tag color="blue">{weight}</Tag>,
      width: 100,
    },
    {
      title: "Scale",
      key: "scale",
      render: (_, record) => {
        const min = record.scaleMin ?? 0;
        const max = record.scaleMax ?? 10;
        return `${min} - ${max}`;
      },
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            disabled={isLocked}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete criterion"
            description="Are you sure you want to delete this criterion? This action cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            disabled={isLocked}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={isLocked}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<CriterionDTO>
      columns={columns}
      dataSource={criteria}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 10,
        showTotal: (total) => `Total ${total} criteria`,
      }}
      locale={{
        emptyText:
          "No criteria defined yet. Click 'Add Criterion' to create one.",
      }}
    />
  );
};

export default CriteriaTable;
