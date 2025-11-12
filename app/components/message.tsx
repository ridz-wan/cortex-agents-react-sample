'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { memo } from 'react';
import { AgentApiState, AgentMessage, AgentMessageRole, AgentMessageChartContent, AgentMessageFetchedTableContent, AgentMessageTextContent, AgentMessageToolResultsContent, AgentMessageToolUseContent, Citation, CortexSearchCitationSource, RELATED_QUERIES_REGEX, RelatedQuery } from '@/lib/agent-api';
import equal from 'fast-deep-equal';
import { prettifyChartSpec } from '@/lib/agent-api/functions/chat/prettifyChartSpec';
import { ChatTextComponent } from './chat-text-component';
import { ChatChartComponent } from './chat-chart-component';
import { ChatRelatedQueriesComponent } from './chat-related-queries-component';
import { ChatCitationsComponent } from './chat-citations-component';
import { Data2AnalyticsMessage } from './chat-data2-message';
import { postProcessAgentText } from '../functions/postProcessAgentText';

const PurePreviewMessage = ({
    message,
    agentState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // isLatestAssistantMessage,
}: {
    message: AgentMessage;
    agentState: AgentApiState,
    // isLatestAssistantMessage: boolean,
}) => {

    let agentApiText = "";
    const role = message.role;
    const citations: Citation[] = [];
    const relatedQueries: RelatedQuery[] = [];
    const agentResponses: React.ReactElement[] = [];

    // iterate over the message content and populate the agentResponses array
    // this logic is useful until we get names / keys associated with each text / tool_results responses to differentiate
    message.content.forEach((content) => {
        // if plain text
        if (content.type === "text") {
            const { text } = (content as AgentMessageTextContent);
            agentApiText = text;

            if (citations.length > 0) {
                relatedQueries.push(...text.matchAll(RELATED_QUERIES_REGEX).map(match => ({
                    relatedQuery: match[1].trim(),
                    answer: match[2].trim()
                })));
            }

            const postProcessedText = postProcessAgentText(text, relatedQueries, citations);

            agentResponses.push(<ChatTextComponent key={text} text={postProcessedText} role={role} />);

            // if execute sql response
        } else if (content.type === "chart") {
            const chart_content = (content as AgentMessageChartContent);
            const chartSpec = prettifyChartSpec(JSON.parse(chart_content.chart.chart_spec));
            agentResponses.push(<ChatChartComponent key={JSON.stringify(chartSpec)} chartSpec={chartSpec} />);
            
        }
    })

    if (agentResponses.length === 0) {
        return null;
    }
    return (
        <AnimatePresence>
            <motion.div
                className="w-full mx-auto max-w-3xl px-4 group/message"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                data-role={message.role}
            >
                <div
                    className='flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-lg group-data-[role=user]/message:w-fit'
                >

                    <div className="flex flex-col gap-4 w-full">
                        {agentResponses}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export const PreviewMessage = memo(
    PurePreviewMessage,
    (prevProps, nextProps) => {
        if (!equal(prevProps.agentState, nextProps.agentState)) return false;
        if (!equal(prevProps.message.content, nextProps.message.content)) return false;
        return true;
    },
);