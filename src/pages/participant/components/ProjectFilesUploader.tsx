import React, { useCallback, useMemo, useState } from "react";
import {
  Upload,
  List,
  Button,
  Modal,
  Progress,
  Typography,
  Space,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { storage, db } from "../../../firebase";
import type { ProjectAttachmentDTO } from "../../../types";

const { Title } = Typography;

export interface ProjectFileViewModel extends ProjectAttachmentDTO {
  uploadStatus?: "uploading" | "success" | "error";
  progress?: number;
  error?: string;
}

interface ProjectFilesUploaderProps {
  projectId: string;
  attachments: ProjectAttachmentDTO[];
  isReadOnly: boolean;
}

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

const ProjectFilesUploader: React.FC<ProjectFilesUploaderProps> = ({
  projectId,
  attachments,
  isReadOnly,
}) => {
  const [uploading, setUploading] = useState<Record<string, number>>({});

  const dataSource: ProjectFileViewModel[] = useMemo(() => {
    return attachments.map((a) => ({ ...a }));
  }, [attachments]);

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (file.size > MAX_SIZE_BYTES) {
      return new Promise((resolve) => {
        Modal.confirm({
          title: "Large file",
          content: "The file exceeds 25MB. Do you want to continue?",
          onOk: () => resolve(true),
          onCancel: () => resolve(Upload.LIST_IGNORE),
        });
      });
    }
    return true;
  };

  const handleUpload: UploadProps["customRequest"] = async ({
    file,
    onError,
    onProgress,
    onSuccess,
  }) => {
    try {
      const uid =
        globalThis.crypto && "randomUUID" in globalThis.crypto
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const storagePath = `projects/${projectId}/${uid}-${(file as File).name}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file as File);

      task.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          setUploading((prev) => ({ ...prev, [storagePath]: pct }));
          onProgress?.({ percent: pct });
        },
        (err) => {
          setUploading((prev) => {
            const copy = { ...prev };
            delete copy[storagePath];
            return copy;
          });
          onError?.(err as Error);
          const code = (err as { code?: string }).code;
          if (code === "storage/unauthorized") {
            message.error("You don't have permission to upload files.");
          } else {
            message.error("Upload failed");
          }
        },
        async () => {
          setUploading((prev) => {
            const copy = { ...prev };
            delete copy[storagePath];
            return copy;
          });

          await addDoc(collection(db, "projects", projectId, "attachments"), {
            name: (file as File).name,
            storagePath,
            createdBy: "", // optional in MVP; server rules validate
            createdAt: Timestamp.now(),
          });
          onSuccess?.({}, new XMLHttpRequest());
          message.success("File uploaded");
        },
      );
    } catch (err) {
      onError?.(err as Error);
      const code = (err as { code?: string }).code;
      if (code === "storage/unauthorized") {
        message.error("You don't have permission to upload files.");
      } else {
        message.error("Upload failed");
      }
    }
  };

  const handleDelete = useCallback(
    async (attachment: ProjectAttachmentDTO) => {
      Modal.confirm({
        title: "Delete file",
        content: `Are you sure you want to delete ${attachment.name}?`,
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await deleteObject(ref(storage, attachment.storagePath));
            await deleteDoc(
              doc(db, "projects", projectId, "attachments", attachment.id),
            );
            message.success("File deleted");
          } catch (err) {
            const code = (err as { code?: string }).code;
            if (code === "storage/unauthorized") {
              message.error("You don't have permission to delete files.");
            } else if (code === "permission-denied") {
              message.error("Permission denied when deleting file.");
            } else {
              message.error("Failed to delete file");
            }
          }
        },
      });
    },
    [projectId],
  );

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Title level={4} style={{ marginBottom: 8 }}>
          Files & Attachments
        </Title>
      </div>

      <Upload.Dragger
        multiple
        disabled={isReadOnly}
        beforeUpload={beforeUpload}
        customRequest={handleUpload}
        showUploadList={false}
        accept="*/*"
      >
        <p className="ant-upload-drag-icon">
          <PlusOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag files to this area to upload
        </p>
        <p className="ant-upload-hint">Maximum size per file: 25MB</p>
      </Upload.Dragger>

      <List
        dataSource={dataSource}
        renderItem={(item) => {
          const progress = uploading[item.storagePath];
          return (
            <List.Item
              actions={
                isReadOnly
                  ? []
                  : [
                      <Button
                        key="delete"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </Button>,
                    ]
              }
            >
              <List.Item.Meta
                title={item.name}
                description={item.storagePath}
              />
              {progress != null && (
                <div style={{ minWidth: 160 }}>
                  <Progress percent={progress} size="small" />
                </div>
              )}
            </List.Item>
          );
        }}
      />
    </Space>
  );
};

export default ProjectFilesUploader;
