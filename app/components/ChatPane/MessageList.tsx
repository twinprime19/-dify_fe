import React, { useEffect, useRef } from 'react'
import type { FC } from 'react'
import Message from './Message'
import type { ChatItem, Feedbacktype } from '@/types/app'

export type MessageListProps = {
    messages: ChatItem[]
    onFeedback?: (messageId: string, feedback: Feedbacktype) => void
    feedbackDisabled?: boolean
    isResponding?: boolean
    className?: string
}

const MessageList: FC<MessageListProps> = ({
    messages,
    onFeedback,
    feedbackDisabled = false,
    isResponding = false,
    className = '',
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages.length])

    if (messages.length === 0) {
        return (
            <div className={`flex items-center justify-center h-full ${className}`}>
                <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">💬</div>
                    <p>Start a conversation</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`flex-1 overflow-y-auto ${className}`}
            aria-live="polite"
            role="log"
            aria-label="Chat messages"
        >
            {messages.map((message, index) => {
                const isLast = index === messages.length - 1
                return (
                    <Message
                        key={message.id}
                        item={message}
                        onFeedback={onFeedback}
                        feedbackDisabled={feedbackDisabled}
                        isResponding={isResponding && isLast && message.isAnswer}
                    />
                )
            })}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default React.memo(MessageList) 