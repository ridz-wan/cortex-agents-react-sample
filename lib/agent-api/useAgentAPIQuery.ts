"use client";

import React from "react";
import { events } from "fetch-event-stream";
import {
  AgentMessage,
  AgentMessageRole,
  StreamBuffer,
  StatusEventData,
  ThinkingDeltaEventData,
  TextDeltaEventData,
  ThinkingEventData,
} from "./types";
import {
  AgentRequestBuildParams,
  buildStandardRequestParams,
} from "./functions/buildStandardRequestParams";
import { toast } from "sonner";
import { removeFetchedTableFromMessages } from "./functions/chat/removeFetchedTableFromMessages";

export interface AgentApiQueryParams
  extends Omit<AgentRequestBuildParams, "messages" | "input"> {
  snowflakeUrl: string;
  cortexDatabase: string;
  cortexSchema: string;
  cortexAgent: string;
}

export enum AgentApiState {
  IDLE = "idle",
  LOADING = "loading",
  STREAMING = "streaming",
  EXECUTING_SQL = "executing_sql",
  RUNNING_ANALYTICS = "running_analytics",
}

export function useAgentAPIQuery(params: AgentApiQueryParams) {
  const { authToken, snowflakeUrl, cortexDatabase, cortexSchema, cortexAgent } =
    params;

  const [agentState, setAgentState] = React.useState<AgentApiState>(
    AgentApiState.IDLE
  );
  const [messages, setMessages] = React.useState<AgentMessage[]>([]);
  const [streamBuffers, setStreamBuffers] = React.useState<StreamBuffer>({});
  const [statusMessage, setStatusMessage] = React.useState("");

  // Print streamBuffers whenever it changes
  React.useEffect(() => {
    // console.log("streamBuffers:", streamBuffers);
    // console.log("streamBuffers (JSON):", JSON.stringify(streamBuffers, null, 2));
    console.log(messages);
  }, [messages]);

  const resetStreamState = React.useCallback(() => {
    // setStreamBuffers({});
  }, []);

  const handleEvent = React.useCallback(
    (eventType: string, payload: string) => {
      try {
        switch (eventType) {
          case "response.status": {
            const statusData = JSON.parse(payload) as StatusEventData;
            setStatusMessage(statusData.message);
            setAgentState(AgentApiState.LOADING);
            break;
          }

          case "response.thinking.delta": {
            const thinkingDelta = JSON.parse(payload) as ThinkingDeltaEventData;
            setStreamBuffers((prev) => ({
              ...prev,
              [thinkingDelta.content_index]:
                (prev[thinkingDelta.content_index] || "") + thinkingDelta.text,
            }));
            setAgentState(AgentApiState.STREAMING);
            break;
          }

          case "response.text.delta": {
            const textDelta = JSON.parse(payload) as TextDeltaEventData;
            setStreamBuffers((prev) => ({
              ...prev,
              [textDelta.content_index]:
                (prev[textDelta.content_index] || "") + textDelta.text,
            }));
            setAgentState(AgentApiState.STREAMING);
            break;
          }

          case "response.thinking": {
            const thinking = JSON.parse(payload) as ThinkingEventData;
            setStreamBuffers((prev) => ({
              ...prev,
              [thinking.content_index]: thinking.text,
            }));
            setAgentState(AgentApiState.STREAMING);
            break;
          }

          case "response": {
            const message = JSON.parse(payload) as AgentMessage;
            setMessages((prev) => [...prev, message]);
            resetStreamState();
            setAgentState(AgentApiState.IDLE);
            break;
          }
        }
      } catch (error) {
        console.error("Error handling event:", error);
      }
    },
    [streamBuffers]
  );

  const handleNewMessage = React.useCallback(
    async (input: string) => {
      if (!authToken) {
        toast.error("Authorization failed: Token is not defined");
        return;
      }

      const newMessages = structuredClone(messages);

      newMessages.push({
        role: AgentMessageRole.USER,
        content: [{ type: "text", text: input }],
      });

      setMessages(newMessages);

      const { headers, body } = buildStandardRequestParams({
        authToken,
        messages: removeFetchedTableFromMessages(newMessages),
        input,
      });

      resetStreamState();
      setAgentState(AgentApiState.LOADING);
      setStatusMessage("Waiting for response...");
      const response = await fetch(
        `${snowflakeUrl}/api/v2/databases/${cortexDatabase}/schemas/${cortexSchema}/agents/${cortexAgent}:run`,
        { method: "POST", headers, body: JSON.stringify(body) }
      );

      const streamEvents = events(response);
      for await (const event of streamEvents) {
        // console.log(event);
        handleEvent(event.event || "", event.data || "");
      }
      // setAgentState(AgentApiState.IDLE);
      // setStatusMessage('');
      // resetStreamState();
    },
    [authToken, messages, handleEvent, resetStreamState]
  );

  return {
    agentState,
    messages,
    statusMessage,
    streamBuffers,
    handleNewMessage,
  };
}
