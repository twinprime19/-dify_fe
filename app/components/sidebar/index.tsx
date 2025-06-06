import React from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusIcon } from '@heroicons/react/24/outline'
import Item from './Item'
import type { ConversationItem } from '@/types/app'

export type ISidebarProps = {
  currentId: string
  onCurrentIdChange: (id: string) => void
  list: ConversationItem[]
  onNewChat: () => void
  className?: string
}

const Sidebar: FC<ISidebarProps> = ({
  currentId,
  onCurrentIdChange,
  list,
  onNewChat,
  className = '',
}) => {
  const { t } = useTranslation()

  return (
    <nav
      role="navigation"
      className={`flex flex-col h-full bg-gray-900 text-white ${className}`}
    >
      {/* New Chat Button */}
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md border border-gray-600 hover:bg-gray-800 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {t('app.chat.newChat')}
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {list.map((item) => (
            <Item
              key={item.id}
              item={item}
              isActive={item.id === currentId}
              onClick={() => onCurrentIdChange(item.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}

export default React.memo(Sidebar)
