import { AnimatePresence, motion } from 'framer-motion';
import type { StreamBuffer } from "@/lib/agent-api";
import { BotIcon } from "./icons";
import { ChatTextComponent } from "./chat-text-component";
import { AgentMessageRole } from "@/lib/agent-api";

interface StreamingMessageProps {
  streamBuffers: StreamBuffer;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  streamBuffers,
}) => {
  const hasContent = Object.keys(streamBuffers).length > 0;

  if (!hasContent) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={AgentMessageRole.ASSISTANT}
      >
        <div className="flex gap-4 w-full">
          <div className="flex flex-col gap-4 w-full">
            {Object.entries(streamBuffers).map(([index, text]) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                  <BotIcon />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs text-gray-500">Answering...</span>
                  </div>
                  <ChatTextComponent text={text} role={AgentMessageRole.ASSISTANT} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};