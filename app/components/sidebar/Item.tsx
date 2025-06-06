import React from 'react'
import type { FC } from 'react'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import type { ConversationItem } from '@/types/app'

export type ItemProps = {
    item: ConversationItem
    isActive: boolean
    onClick: () => void
}

const Item: FC<ItemProps> = ({ item, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            aria-current={isActive ? 'page' : undefined}
            className={`
        w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-md transition-colors
        ${isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
      `}
        >
            <ChatBubbleLeftIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
        </button>
    )
}

export default React.memo(Item) 