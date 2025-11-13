'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import { ChevronDownIcon } from "./icons";

export interface ChatThinkingComponentProps {
    text: string;
    role: string;
    defaultCollapsed?: boolean;
}

export function ChatThinkingComponent(props: ChatThinkingComponentProps) {
    const { text, role, defaultCollapsed = true } = props;
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className="flex flex-row gap-2 items-start">
            <div
                className={cn('flex flex-col bg-violet-300 px-4 py-3 rounded-xl gap-4 w-full', {
                    'bg-gray-300 px-4 py-3 rounded-xl':
                        role === 'user',
                })}
            >
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    aria-expanded={!isCollapsed}
                >
                    <motion.div
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDownIcon size={16} />
                    </motion.div>
                    <span>Reasoning</span>
                </button>
                
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2">
                                <Markdown>{text}</Markdown>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

