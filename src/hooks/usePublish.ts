import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { message } from "antd";
import type {
  PublishResultsCommand,
  PublishResultsResponse,
  RepublishResultsCommand,
  RepublishResultsResponse,
} from "../types";

export const usePublish = () => {
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isRepublishing, setIsRepublishing] = useState<boolean>(false);

  const publish = async (eventId: string) => {
    try {
      setIsPublishing(true);
      const functions = getFunctions();
      const publishResults = httpsCallable<
        PublishResultsCommand,
        PublishResultsResponse
      >(functions, "publishResults");

      const result = await publishResults({ eventId });

      message.success(
        `Results published successfully! ${result.data.published} projects published.`,
      );
      return result.data;
    } catch (err) {
      console.error("Error publishing results:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to publish results";
      message.error(errorMessage);
      throw err;
    } finally {
      setIsPublishing(false);
    }
  };

  const republish = async (eventId: string, reason?: string) => {
    try {
      setIsRepublishing(true);
      const functions = getFunctions();
      const republishResults = httpsCallable<
        RepublishResultsCommand,
        RepublishResultsResponse
      >(functions, "republishResults");

      const result = await republishResults({ eventId, reason });

      message.success(
        `Results republished successfully! ${result.data.published} projects updated.`,
      );
      return result.data;
    } catch (err) {
      console.error("Error republishing results:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to republish results";
      message.error(errorMessage);
      throw err;
    } finally {
      setIsRepublishing(false);
    }
  };

  return { publish, republish, isPublishing, isRepublishing };
};
