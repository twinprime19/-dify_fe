'use client'
import type { FC } from 'react'
import React from 'react'
import type { IChatItem } from '../type'
import { Markdown } from '@/app/components/base/markdown'
import ImageGallery from '@/app/components/base/image-gallery'

type IQuestionProps = Pick<
  IChatItem,
  'id' | 'content' | 'useCurrentUserAvatar'
> & {
  imgSrcs?: string[]
}

const Question: FC<IQuestionProps> = ({
  id,
  content,
  useCurrentUserAvatar,
  imgSrcs,
}) => {
  const userName = 'You'
  return (
    <div className="flex items-start justify-end gap-3 mb-6" key={id}>
      {/* Message Content */}
      <div className="max-w-2xl">
        <div className="bg-primary-500 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
          {imgSrcs && imgSrcs.length > 0 && (
            <div className="mb-3">
              <ImageGallery srcs={imgSrcs} />
            </div>
          )}
          <div className="prose prose-sm prose-invert max-w-none">
            <Markdown content={content} />
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0">
        {useCurrentUserAvatar ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
            {userName?.[0]?.toUpperCase() || 'U'}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(Question)
