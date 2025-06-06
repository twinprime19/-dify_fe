import React, { useState, useRef } from 'react'
import type { FC } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Textarea from 'rc-textarea'

export type ChatInputProps = {
    onSend: (message: string) => void
    disabled?: boolean
    placeholder?: string
    className?: string
}

const ChatInput: FC<ChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = "Send a message",
    className = '',
}) => {
    const [value, setValue] = useState('')
    const textareaRef = useRef<any>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!value.trim() || disabled) return

        onSend(value.trim())
        setValue('')
        textareaRef.current?.focus()
    }

    const handleChange = (e: any) => {
        setValue(e.target.value)
    }

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <div className={`border-t border-gray-200 bg-white ${className}`}>
            <div className="max-w-4xl mx-auto px-4 py-4">
                <form onSubmit={handleSubmit} className="relative">
                    <div className="flex items-end gap-3 bg-white rounded-xl border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            className="flex-1 resize-none bg-transparent border-0 outline-none p-3 pr-12 placeholder-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={!value.trim() || disabled}
                            aria-label="Send message"
                            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200 ${value.trim() && !disabled
                                ? 'text-white bg-blue-600 hover:bg-blue-700'
                                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                }`}
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default React.memo(ChatInput) 