import React, { useState } from 'react'
import type { FC, ReactNode } from 'react'
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid'
import { UserIcon } from '@heroicons/react/24/solid'
import { Markdown } from '@/app/components/base/markdown'
import type { ChatItem, Feedbacktype } from '@/types/app'

export type MessageProps = {
    item: ChatItem
    onFeedback?: (messageId: string, feedback: Feedbacktype) => void
    feedbackDisabled?: boolean
    isResponding?: boolean
}

const AIAvatar: FC<{ isResponding?: boolean }> = ({ isResponding }) => (
    <div className="w-8 h-8 rounded-sm bg-green-600 flex items-center justify-center text-white text-sm font-medium">
        {isResponding ? (
            <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        ) : (
            'AI'
        )}
    </div>
)

const UserAvatar: FC = () => (
    <div className="w-8 h-8 rounded-sm bg-gray-700 flex items-center justify-center">
        <UserIcon className="w-5 h-5 text-white" />
    </div>
)

const Message: FC<MessageProps> = ({
    item,
    onFeedback,
    feedbackDisabled = false,
    isResponding = false
}) => {
    const [isHovered, setIsHovered] = useState(false)
    const isUser = !item.isAnswer
    const bgColor = isUser ? 'bg-user' : 'bg-ai'

    const handleFeedback = (rating: 'like' | 'dislike') => {
        if (!onFeedback) return
        const newRating = item.feedback?.rating === rating ? null : rating
        onFeedback(item.id, { rating: newRating })
    }

    return (
        <div
            className={`w-full ${bgColor} transition-opacity duration-200`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {isUser ? <UserAvatar /> : <AIAvatar isResponding={isResponding} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="prose prose-gray max-w-none">
                            {isResponding && !item.content ? (
                                <div className="flex items-center py-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            ) : (
                                <Markdown content={item.content} />
                            )}
                        </div>

                        {/* Timestamp and Actions */}
                        <div className={`flex items-center justify-between mt-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="text-xs text-gray-500">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            {/* Feedback for AI messages */}
                            {!isUser && !feedbackDisabled && !item.feedbackDisabled && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleFeedback('like')}
                                        disabled={isResponding}
                                        className={`p-1.5 rounded transition-colors ${item.feedback?.rating === 'like'
                                                ? 'bg-green-100 text-green-600'
                                                : 'hover:bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {item.feedback?.rating === 'like' ? (
                                            <HandThumbUpSolid className="w-4 h-4" />
                                        ) : (
                                            <HandThumbUpIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleFeedback('dislike')}
                                        disabled={isResponding}
                                        className={`p-1.5 rounded transition-colors ${item.feedback?.rating === 'dislike'
                                                ? 'bg-red-100 text-red-600'
                                                : 'hover:bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {item.feedback?.rating === 'dislike' ? (
                                            <HandThumbDownSolid className="w-4 h-4" />
                                        ) : (
                                            <HandThumbDownIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(Message) 