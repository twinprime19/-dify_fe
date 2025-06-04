'use client'
import type { FC } from 'react'
import React from 'react'
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import { HandThumbDownIcon as HandThumbDownSolid, HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid'
import { useTranslation } from 'react-i18next'
import LoadingAnim from '../loading-anim'
import type { FeedbackFunc } from '../type'
import ImageGallery from '../../base/image-gallery'
import Thought from '../thought'
import type { ChatItem, MessageRating, VisionFile } from '@/types/app'
import WorkflowProcess from '@/app/components/workflow/workflow-process'
import { Markdown } from '@/app/components/base/markdown'
import type { Emoji } from '@/types/tools'

const RatingButton: FC<{
  isLike: boolean
  isActive?: boolean
  onClick: () => void
  disabled?: boolean
}> = ({ isLike, isActive, onClick, disabled }) => {
  const Icon = isActive ? (isLike ? HandThumbUpSolid : HandThumbDownSolid) : (isLike ? HandThumbUpIcon : HandThumbDownIcon)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-all duration-200 ${isActive
          ? isLike
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

const AIAvatar: FC<{ isResponding?: boolean }> = ({ isResponding }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-sm">
    {isResponding ? (
      <LoadingAnim type='avatar' />
    ) : (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    )}
  </div>
)

type IAnswerProps = {
  item: ChatItem
  feedbackDisabled: boolean
  onFeedback?: FeedbackFunc
  isResponding?: boolean
  allToolIcons?: Record<string, string | Emoji>
}

const Answer: FC<IAnswerProps> = ({
  item,
  feedbackDisabled = false,
  onFeedback,
  isResponding,
  allToolIcons,
}) => {
  const { id, content, feedback, agent_thoughts, workflowProcess } = item
  const isAgentMode = !!agent_thoughts && agent_thoughts.length > 0
  const { t } = useTranslation()

  const getImgs = (list?: VisionFile[]) => {
    if (!list) return []
    return list.filter(
      file => file.type === 'image' && file.belongs_to === 'assistant'
    )
  }

  const agentModeAnswer = (
    <div className="space-y-4">
      {agent_thoughts?.map((item, index) => (
        <div key={index} className="space-y-3">
          {item.thought && (
            <div className="prose prose-sm max-w-none">
              <Markdown content={item.thought} />
            </div>
          )}

          {!!item.tool && (
            <Thought
              thought={item}
              allToolIcons={allToolIcons || {}}
              isFinished={!!item.observation || !isResponding}
            />
          )}

          {getImgs(item.message_files).length > 0 && (
            <ImageGallery
              srcs={getImgs(item.message_files).map(item => item.url)}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderContent = () => {
    if (isResponding &&
      (isAgentMode
        ? !content &&
        (agent_thoughts || []).filter(
          item => !!item.thought || !!item.tool
        ).length === 0
        : !content)
    ) {
      return (
        <div className="flex items-center justify-center py-3">
          <LoadingAnim type="text" />
        </div>
      )
    }

    if (isAgentMode) {
      return agentModeAnswer
    }

    return (
      <div className="prose prose-sm max-w-none">
        <Markdown content={content} />
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 mb-6">
      {/* AI Avatar */}
      <AIAvatar isResponding={isResponding} />

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          {workflowProcess && (
            <div className="mb-4">
              <WorkflowProcess data={workflowProcess} hideInfo />
            </div>
          )}

          {renderContent()}
        </div>

        {/* Timestamp and Actions */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Feedback Actions */}
          {!feedbackDisabled && !item.feedbackDisabled && (
            <div className="flex items-center gap-1">
              <RatingButton
                isLike={true}
                isActive={feedback?.rating === 'like'}
                onClick={() => onFeedback?.(id, {
                  rating: feedback?.rating === 'like' ? null : 'like'
                })}
                disabled={isResponding}
              />
              <RatingButton
                isLike={false}
                isActive={feedback?.rating === 'dislike'}
                onClick={() => onFeedback?.(id, {
                  rating: feedback?.rating === 'dislike' ? null : 'dislike'
                })}
                disabled={isResponding}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Answer)
