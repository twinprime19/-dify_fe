import React from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChatBubbleOvalLeftEllipsisIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon } from '@heroicons/react/24/solid'
import Button from '@/app/components/base/button'
// import Card from './card'
import type { ConversationItem } from '@/types/app'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const MAX_CONVERSATION_LENTH = 20

export type ISidebarProps = {
  copyRight: string
  currentId: string
  onCurrentIdChange: (id: string) => void
  list: ConversationItem[]
}

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  list,
}) => {
  const { t } = useTranslation()
  return (
    <div className='shrink-0 flex flex-col overflow-y-auto glass-effect pc:w-[280px] tablet:w-[240px] mobile:w-[280px] border-r border-white/20 tablet:h-[calc(100vh_-_4rem)] mobile:h-screen'>
      {list.length < MAX_CONVERSATION_LENTH && (
        <div className='flex flex-shrink-0 p-6 pb-4'>
          <button
            onClick={() => {
              onCurrentIdChange('-1')
            }}
            className='group block w-full flex-shrink-0 h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl flex items-center justify-center text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
          >
            <PencilSquareIcon className='mr-2 h-5 w-5' />
            {t('app.chat.newChat')}
          </button>
        </div>
      )}

      <nav className='flex-1 space-y-2 px-4 pb-4'>
        {list.map((item, index) => {
          const isCurrent = item.id === currentId
          const ItemIcon = isCurrent
            ? ChatBubbleOvalLeftEllipsisSolidIcon
            : ChatBubbleOvalLeftEllipsisIcon
          return (
            <div
              onClick={() => onCurrentIdChange(item.id)}
              key={item.id}
              className={classNames(
                isCurrent
                  ? 'bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-primary-700 border-primary-200/50 shadow-lg'
                  : 'text-gray-700 hover:bg-white/30 hover:text-gray-900 border-transparent',
                'group flex items-center rounded-2xl px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-200 border backdrop-blur-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'slideInFromLeft 0.3s ease-out forwards'
              }}
            >
              <ItemIcon
                className={classNames(
                  isCurrent
                    ? 'text-primary-600'
                    : 'text-gray-500 group-hover:text-primary-500',
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200'
                )}
                aria-hidden='true'
              />
              <span className='truncate font-medium'>
                {item.name}
              </span>
            </div>
          )
        })}
      </nav>

      <div className='flex flex-shrink-0 p-6 pt-4 border-t border-white/10'>
        <div className='text-gray-500 font-medium text-xs flex items-center space-x-1'>
          <span>©</span>
          <span className='text-gradient-primary font-semibold'>{copyRight}</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Sidebar)
