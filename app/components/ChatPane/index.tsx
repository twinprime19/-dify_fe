import React from 'react'
import type { FC } from 'react'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import type { ChatItem, Feedbacktype, VisionFile } from '@/types/app'

export type ChatPaneProps = {
    messages: ChatItem[]
    onSend: (message: string, files?: VisionFile[]) => void
    onFeedback?: (messageId: string, feedback: Feedbacktype) => void
    feedbackDisabled?: boolean
    isResponding?: boolean
    className?: string
}

const ChatPane: FC<ChatPaneProps> = ({
    messages,
    onSend,
    onFeedback,
    feedbackDisabled = false,
    isResponding = false,
    className = '',
}) => {
    const handleSend = (message: string) => {
        onSend(message)
    }

    return (
        <div className={`flex flex-col h-full max-w-4xl mx-auto ${className}`}>
            <MessageList
                messages={messages}
                onFeedback={onFeedback}
                feedbackDisabled={feedbackDisabled}
                isResponding={isResponding}
                className="flex-1"
            />
            <ChatInput
                onSend={handleSend}
                disabled={isResponding}
                placeholder="Send a message"
            />
        </div>
    )
}

export default React.memo(ChatPane) 