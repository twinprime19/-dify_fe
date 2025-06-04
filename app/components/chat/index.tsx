'use client'
import type { FC } from 'react'
import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import Textarea from 'rc-textarea'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Answer from './answer'
import Question from './question'
import type { FeedbackFunc } from './type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Toast from '@/app/components/base/toast'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'

export type IChatProps = {
  chatList: ChatItem[]
  /**
   * Whether to display the editing area and rating status
   */
  feedbackDisabled?: boolean
  /**
   * Whether to display the input area
   */
  isHideSendInput?: boolean
  onFeedback?: FeedbackFunc
  checkCanSend?: () => boolean
  onSend?: (message: string, files: VisionFile[]) => void
  useCurrentUserAvatar?: boolean
  isResponding?: boolean
  controlClearQuery?: number
  visionConfig?: VisionSettings
}

const Chat: FC<IChatProps> = ({
  chatList,
  feedbackDisabled = false,
  isHideSendInput = false,
  onFeedback,
  checkCanSend,
  onSend = () => { },
  useCurrentUserAvatar,
  isResponding,
  controlClearQuery,
  visionConfig,
}) => {
  const { t } = useTranslation()
  const { notify } = Toast
  const isUseInputMethod = useRef(false)
  const textareaRef = useRef<any>(null)

  const [query, setQuery] = React.useState('')
  const handleContentChange = (e: any) => {
    const value = e.target.value
    setQuery(value)
  }

  const logError = (message: string) => {
    notify({ type: 'error', message, duration: 3000 })
  }

  const valid = () => {
    if (!query || query.trim() === '') {
      logError('Message cannot be empty')
      return false
    }
    return true
  }

  useEffect(() => {
    if (controlClearQuery) setQuery('')
  }, [controlClearQuery])

  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  const handleSend = () => {
    if (!valid() || (checkCanSend && !checkCanSend())) return
    onSend(
      query,
      files
        .filter(file => file.progress !== -1)
        .map(fileItem => ({
          type: 'image',
          transfer_method: fileItem.type,
          url: fileItem.url,
          upload_file_id: fileItem.fileId,
        }))
    )
    if (
      !files.find(
        item => item.type === TransferMethod.local_file && !item.fileId
      )
    ) {
      if (files.length) onClear()
      if (!isResponding) setQuery('')
    }
  }

  const handleKeyUp = (e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      if (!e.shiftKey && !isUseInputMethod.current) handleSend()
    }
  }

  const handleKeyDown = (e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing
    if (e.code === 'Enter' && !e.shiftKey) {
      setQuery(query.replace(/\n$/, ''))
      e.preventDefault()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {chatList.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary-400 to-accent-400 flex items-center justify-center mb-6 animate-pulseGlow">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800">Start a conversation</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Ask me anything, and I'll do my best to help you out!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {chatList.map((item, index) => {
                if (item.isAnswer) {
                  const isLast = item.id === chatList[chatList.length - 1].id
                  return (
                    <div
                      key={item.id}
                      className="animate-fadeInUp"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <Answer
                        item={item}
                        feedbackDisabled={feedbackDisabled}
                        onFeedback={onFeedback}
                        isResponding={isResponding && isLast}
                      />
                    </div>
                  )
                }
                return (
                  <div
                    key={item.id}
                    className="animate-fadeInUp"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <Question
                      id={item.id}
                      content={item.content}
                      useCurrentUserAvatar={useCurrentUserAvatar}
                      imgSrcs={
                        item.message_files && item.message_files?.length > 0
                          ? item.message_files.map(item => item.url)
                          : []
                      }
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {!isHideSendInput && (
        <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-4">
            {/* Image Upload Area */}
            {visionConfig?.enabled && files.length > 0 && (
              <div className="mb-3 pb-3 border-b border-gray-100">
                <ImageList
                  list={files}
                  onRemove={onRemove}
                  onReUpload={onReUpload}
                  onImageLinkLoadSuccess={onImageLinkLoadSuccess}
                  onImageLinkLoadError={onImageLinkLoadError}
                />
              </div>
            )}

            {/* Message Input */}
            <div className="relative flex items-end gap-3">
              {/* Image Upload Button */}
              {visionConfig?.enabled && (
                <div className="flex-shrink-0 pb-2">
                  <ChatImageUploader
                    settings={visionConfig}
                    onUpload={onUpload}
                    disabled={files.length >= visionConfig.number_limits}
                  />
                </div>
              )}

              {/* Text Input */}
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20 bg-white/80 backdrop-blur-sm transition-all duration-200"
                  placeholder="Type your message..."
                  value={query}
                  onChange={handleContentChange}
                  onKeyUp={handleKeyUp}
                  onKeyDown={handleKeyDown}
                  autoSize={{ minRows: 1, maxRows: 6 }}
                />

                {/* Send Button */}
                <button
                  type="button"
                  disabled={!query.trim() || isResponding}
                  onClick={handleSend}
                  className={cn(
                    "absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-200",
                    query.trim() && !isResponding
                      ? "bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-2 text-xs text-gray-400 text-center">
              Press Enter to send • Shift + Enter for new line
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
