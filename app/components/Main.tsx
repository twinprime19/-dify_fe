'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { produce, setAutoFreeze } from 'immer'
import { useBoolean, useGetState } from 'ahooks'
import Sidebar from '@/app/components/sidebar'
import ChatPane from '@/app/components/ChatPane'
import useConversation from '@/hooks/use-conversation'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import {
    fetchAppParams,
    fetchChatList,
    fetchConversations,
    generationConversationName,
    sendChatMessage,
    updateFeedback
} from '@/service'
import type {
    ChatItem,
    ConversationItem,
    Feedbacktype,
    PromptConfig,
    VisionFile,
    VisionSettings,
} from '@/types/app'
import { Resolution, TransferMethod, WorkflowRunningStatus } from '@/types/app'
import { setLocaleOnClient } from '@/i18n/client'
import {
    replaceVarWithValues,
    userInputsFormToPromptVariables,
} from '@/utils/prompt'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'
import AppUnavailable from '@/app/components/app-unavailable'
import Loading from '@/app/components/base/loading'
import {
    API_KEY,
    API_URL,
    APP_ID,
    APP_INFO,
    isShowPrompt,
    promptTemplate,
} from '@/config'
import type { Annotation as AnnotationType } from '@/types/log'
import Toast from '@/app/components/base/toast'

const Main: FC = () => {
    const { t } = useTranslation()
    const media = useBreakpoints()
    const isMobile = media === MediaType.mobile
    const { notify } = Toast

    // Check for development bypass parameter
    const [isDevelopmentBypass, setIsDevelopmentBypass] = useState(false)

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const bypassParam = searchParams.get('bypass')
        const bypassCookie = document.cookie.includes('dev-bypass=true')

        if (bypassParam === 'dev' || bypassCookie) {
            setIsDevelopmentBypass(true)
            console.log('Development bypass mode enabled')
        }

        // Allow clearing bypass mode
        if (bypassParam === 'clear') {
            setIsDevelopmentBypass(false)
            document.cookie =
                'dev-bypass=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;'
            console.log('Development bypass mode cleared')
        }
    }, [])

    // Improved configuration check with debugging - now accounts for dev bypass
    const hasSetAppConfig =
        isDevelopmentBypass ||
        (APP_ID &&
            API_KEY &&
            APP_ID !== 'undefined' &&
            API_KEY !== 'undefined' &&
            APP_ID.trim() !== '' &&
            API_KEY.trim() !== '')

    // Mobile sidebar state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // App state
    const [appUnavailable, setAppUnavailable] = useState<boolean>(false)
    const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false)
    const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
    const [inited, setInited] = useState<boolean>(false)
    const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
        enabled: false,
        number_limits: 2,
        detail: Resolution.low,
        transfer_methods: [TransferMethod.local_file],
    })

    useEffect(() => {
        if (APP_INFO?.title) document.title = `${APP_INFO.title} - Powered by Dify`
    }, [APP_INFO?.title])

    // onData change thought (the produce obj). https://github.com/immerjs/immer/issues/576
    useEffect(() => {
        setAutoFreeze(false)
        return () => {
            setAutoFreeze(true)
        }
    }, [])

    // Conversation state
    const {
        conversationList,
        setConversationList,
        currConversationId,
        getCurrConversationId,
        setCurrConversationId,
        getConversationIdFromStorage,
        isNewConversation,
        currConversationInfo,
        currInputs,
        newConversationInputs,
        resetNewConversationInputs,
        setCurrInputs,
        setNewConversationInfo,
        setExistConversationInfo,
    } = useConversation()

    const [
        conversationIdChangeBecauseOfNew,
        setConversationIdChangeBecauseOfNew,
        getConversationIdChangeBecauseOfNew,
    ] = useGetState(false)

    const conversationName =
        currConversationInfo?.name || (t('app.chat.newChatDefaultName') as string)
    const conversationIntroduction = currConversationInfo?.introduction || ''

    // Chat state
    const [chatList, setChatList, getChatList] = useGetState<ChatItem[]>([])
    const [isResponding, { setTrue: setRespondingTrue, setFalse: setRespondingFalse }] = useBoolean(false)
    const [abortController, setAbortController] = useState<AbortController | null>(null)

    // Memoize commonly used translations to prevent re-renders
    const newChatDefaultName = useMemo(
        () => t('app.chat.newChatDefaultName'),
        [t]
    )

    const createNewChat = () => {
        // if new chat is already exist, do not create new chat
        if (conversationList.some(item => item.id === '-1')) return

        setConversationList(
            produce(conversationList, draft => {
                draft.unshift({
                    id: '-1',
                    name: newChatDefaultName,
                    inputs: newConversationInputs,
                    introduction: conversationIntroduction,
                })
            })
        )
    }

    // Memoize generateNewChatListWithOpenStatement to prevent recreation on every render
    const generateNewChatListWithOpenStatement = useCallback(
        (introduction?: string, inputs?: Record<string, any> | null) => {
            let calculatedIntroduction =
                introduction || conversationIntroduction || ''
            const calculatedPromptVariables = inputs || currInputs || null
            if (calculatedIntroduction && calculatedPromptVariables)
                calculatedIntroduction = replaceVarWithValues(
                    calculatedIntroduction,
                    promptConfig?.prompt_variables || [],
                    calculatedPromptVariables
                )

            const openStatement = {
                id: `${Date.now()}`,
                content: calculatedIntroduction,
                isAnswer: true,
                feedbackDisabled: true,
                isOpeningStatement: isShowPrompt,
            }
            if (calculatedIntroduction) return [openStatement]

            return []
        },
        [conversationIntroduction, currInputs, promptConfig?.prompt_variables]
    )

    const handleConversationSwitch = () => {
        if (!inited) return

        // update inputs of current conversation
        let notSyncToStateIntroduction = ''
        let notSyncToStateInputs: Record<string, any> | undefined | null = {}
        if (!isNewConversation) {
            const item = conversationList.find(item => item.id === currConversationId)
            notSyncToStateInputs = item?.inputs || {}
            setCurrInputs(notSyncToStateInputs as any)
            notSyncToStateIntroduction = item?.introduction || ''
            setExistConversationInfo({
                name: item?.name || '',
                introduction: notSyncToStateIntroduction,
            })
        } else {
            notSyncToStateInputs = newConversationInputs
            setCurrInputs(notSyncToStateInputs)
        }

        // update chat list of current conversation
        if (!isNewConversation && !conversationIdChangeBecauseOfNew) {
            fetchChatList(currConversationId).then((res: any) => {
                const { data } = res
                const newChatList: ChatItem[] = generateNewChatListWithOpenStatement(
                    notSyncToStateIntroduction,
                    notSyncToStateInputs
                )

                data.forEach((item: any) => {
                    newChatList.push({
                        id: `question-${item.id}`,
                        content: item.query,
                        isAnswer: false,
                        message_files:
                            item.message_files?.filter(
                                (file: any) => file.belongs_to === 'user'
                            ) || [],
                    })
                    newChatList.push({
                        id: item.id,
                        content: item.answer,
                        agent_thoughts: addFileInfos(
                            item.agent_thoughts
                                ? sortAgentSorts(item.agent_thoughts)
                                : item.agent_thoughts,
                            item.message_files
                        ),
                        feedback: item.feedback,
                        isAnswer: true,
                        message_files:
                            item.message_files?.filter(
                                (file: any) => file.belongs_to === 'assistant'
                            ) || [],
                    })
                })
                setChatList(newChatList)
            })
        }

        if (isNewConversation)
            setChatList(generateNewChatListWithOpenStatement())
    }
    useEffect(handleConversationSwitch, [currConversationId, inited])

    const handleConversationIdChange = (id: string) => {
        if (id === '-1') {
            createNewChat()
            setConversationIdChangeBecauseOfNew(true)
        } else {
            setConversationIdChangeBecauseOfNew(false)
        }
        // trigger handleConversationSwitch
        setCurrConversationId(id, APP_ID)
        setMobileMenuOpen(false)
    }

    // Handle new chat
    const handleNewChat = () => {
        handleConversationIdChange('-1')
    }

    // Initialize app
    useEffect(() => {
        if (!hasSetAppConfig) {
            setAppUnavailable(true)
            return
        }
        ; (async () => {
            try {
                // Reset app unavailable state in case it was previously set
                setAppUnavailable(false)

                // If in development bypass mode, provide default configuration
                if (isDevelopmentBypass) {
                    setLocaleOnClient(APP_INFO.default_language, true)
                    setNewConversationInfo({
                        name: t('app.chat.newChatDefaultName'),
                        introduction: 'Welcome to the development chat!',
                    })
                    setPromptConfig({
                        prompt_template: promptTemplate,
                        prompt_variables: [],
                    } as PromptConfig)
                    setVisionConfig({
                        enabled: false,
                        number_limits: 2,
                        detail: Resolution.low,
                        transfer_methods: [TransferMethod.local_file],
                    })
                    setConversationList([])
                    setInited(true)
                    return
                }

                const [conversationData, appParams] = await Promise.all([
                    fetchConversations(),
                    fetchAppParams(),
                ])

                // handle current conversation id
                const { data: conversations, error } = conversationData as {
                    data: ConversationItem[]
                    error: string
                }
                if (error) {
                    Toast.notify({ type: 'error', message: error })
                    throw new Error(error)
                }
                const _conversationId = getConversationIdFromStorage(APP_ID)
                const isNotNewConversation = conversations.some(
                    item => item.id === _conversationId
                )

                // fetch new conversation info
                const {
                    user_input_form,
                    opening_statement: introduction,
                    file_upload,
                    system_parameters,
                }: any = appParams
                setLocaleOnClient(APP_INFO.default_language, true)
                setNewConversationInfo({
                    name: t('app.chat.newChatDefaultName'),
                    introduction,
                })
                const prompt_variables =
                    userInputsFormToPromptVariables(user_input_form)
                setPromptConfig({
                    prompt_template: promptTemplate,
                    prompt_variables,
                } as PromptConfig)
                setVisionConfig({
                    ...file_upload?.image,
                    image_file_size_limit: system_parameters?.system_parameters || 0,
                })
                setConversationList(conversations as ConversationItem[])

                if (isNotNewConversation)
                    setCurrConversationId(_conversationId, APP_ID, false)

                setInited(true)
            } catch (e: any) {
                if (e.status === 404) {
                    setAppUnavailable(true)
                } else {
                    setIsUnknownReason(true)
                    setAppUnavailable(true)
                }
            }
        })()
    }, [isDevelopmentBypass])

    const logError = (message: string) => {
        notify({ type: 'error', message })
    }

    const checkCanSend = () => {
        if (currConversationId !== '-1') return true

        if (!currInputs || !promptConfig?.prompt_variables) return true

        const inputLens = Object.values(currInputs).length
        const promptVariablesLens = promptConfig.prompt_variables.length

        const emptyInput =
            inputLens < promptVariablesLens || Object.values(currInputs).find(v => !v)
        if (emptyInput) {
            logError(t('app.errorMessage.valueOfVarRequired'))
            return false
        }
        return true
    }

    const [
        isRespondingConIsCurrCon,
        setIsRespondingConCurrCon,
        getIsRespondingConIsCurrCon,
    ] = useGetState(true)

    const updateCurrentQA = ({
        responseItem,
        questionId,
        placeholderAnswerId,
        questionItem,
    }: {
        responseItem: ChatItem
        questionId: string
        placeholderAnswerId: string
        questionItem: ChatItem
    }) => {
        // closesure new list is outdated.
        const newListWithAnswer = produce(
            getChatList().filter(
                item => item.id !== responseItem.id && item.id !== placeholderAnswerId
            ),
            draft => {
                if (!draft.find(item => item.id === questionId))
                    draft.push({ ...questionItem })

                draft.push({ ...responseItem })
            }
        )
        setChatList(newListWithAnswer)
    }

    // Handle send message
    const handleSend = async (message: string, files?: VisionFile[]) => {
        if (isResponding) {
            notify({ type: 'info', message: t('app.errorMessage.waitForResponse') })
            return
        }

        if (!checkCanSend()) return

        const data: Record<string, any> = {
            inputs: currInputs,
            query: message,
            conversation_id: isNewConversation ? null : currConversationId,
        }

        if (visionConfig?.enabled && files && files?.length > 0) {
            data.files = files.map(item => {
                if (item.transfer_method === TransferMethod.local_file) {
                    return {
                        ...item,
                        url: '',
                    }
                }
                return item
            })
        }

        // question
        const questionId = `question-${Date.now()}`
        const questionItem = {
            id: questionId,
            content: message,
            isAnswer: false,
            message_files: files,
        }

        const placeholderAnswerId = `answer-placeholder-${Date.now()}`
        const placeholderAnswerItem = {
            id: placeholderAnswerId,
            content: '',
            isAnswer: true,
        }

        const newList = [...getChatList(), questionItem, placeholderAnswerItem]
        setChatList(newList)

        let isAgentMode = false

        // answer
        const responseItem: ChatItem = {
            id: `${Date.now()}`,
            content: '',
            agent_thoughts: [],
            message_files: [],
            isAnswer: true,
        }
        let hasSetResponseId = false

        const prevTempNewConversationId = getCurrConversationId() || '-1'
        let tempNewConversationId = ''

        setRespondingTrue()
        sendChatMessage(data, {
            getAbortController: abortController => {
                setAbortController(abortController)
            },
            onData: (
                message: string,
                isFirstMessage: boolean,
                { conversationId: newConversationId, messageId, taskId }: any
            ) => {
                if (!isAgentMode) {
                    responseItem.content = responseItem.content + message
                } else {
                    const lastThought =
                        responseItem.agent_thoughts?.[
                        responseItem.agent_thoughts?.length - 1
                        ]
                    if (lastThought) lastThought.thought = lastThought.thought + message // need immer setAutoFreeze
                }
                if (messageId && !hasSetResponseId) {
                    responseItem.id = messageId
                    hasSetResponseId = true
                }

                if (isFirstMessage && newConversationId)
                    tempNewConversationId = newConversationId

                // has switched to other conversation
                if (prevTempNewConversationId !== getCurrConversationId()) {
                    setIsRespondingConCurrCon(false)
                    return
                }
                updateCurrentQA({
                    responseItem,
                    questionId,
                    placeholderAnswerId,
                    questionItem,
                })
            },
            async onCompleted(hasError?: boolean) {
                if (hasError) return

                if (getConversationIdChangeBecauseOfNew()) {
                    const { data: allConversations }: any = await fetchConversations()
                    const newItem: any = await generationConversationName(
                        allConversations[0].id
                    )

                    const newAllConversations = produce(
                        allConversations,
                        (draft: any) => {
                            draft[0].name = newItem.name
                        }
                    )
                    setConversationList(newAllConversations as any)
                }
                setConversationIdChangeBecauseOfNew(false)
                resetNewConversationInputs()
                setCurrConversationId(tempNewConversationId, APP_ID, true)
                setRespondingFalse()
            },
            onFile(file) {
                const lastThought =
                    responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
                if (lastThought)
                    lastThought.message_files = [
                        ...(lastThought as any).message_files,
                        { ...file },
                    ]

                updateCurrentQA({
                    responseItem,
                    questionId,
                    placeholderAnswerId,
                    questionItem,
                })
            },
            onThought(thought) {
                isAgentMode = true
                const response = responseItem as any
                if (thought.message_id && !hasSetResponseId) {
                    response.id = thought.message_id
                    hasSetResponseId = true
                }
                if (response.agent_thoughts.length === 0) {
                    response.agent_thoughts.push(thought)
                } else {
                    const lastThought =
                        response.agent_thoughts[response.agent_thoughts.length - 1]
                    // thought changed but still the same thought, so update.
                    if (lastThought.id === thought.id) {
                        thought.thought = lastThought.thought
                        thought.message_files = lastThought.message_files
                        responseItem.agent_thoughts![response.agent_thoughts.length - 1] =
                            thought
                    } else {
                        responseItem.agent_thoughts!.push(thought)
                    }
                }
                // has switched to other conversation
                if (prevTempNewConversationId !== getCurrConversationId()) {
                    setIsRespondingConCurrCon(false)
                    return false
                }

                updateCurrentQA({
                    responseItem,
                    questionId,
                    placeholderAnswerId,
                    questionItem,
                })
            },
            onMessageEnd: messageEnd => {
                if (messageEnd.metadata?.annotation_reply) {
                    responseItem.id = messageEnd.id
                    responseItem.annotation = {
                        id: messageEnd.metadata.annotation_reply.id,
                        authorName: messageEnd.metadata.annotation_reply.account.name,
                    } as AnnotationType
                    const newListWithAnswer = produce(
                        getChatList().filter(
                            item =>
                                item.id !== responseItem.id && item.id !== placeholderAnswerId
                        ),
                        draft => {
                            if (!draft.find(item => item.id === questionId))
                                draft.push({ ...questionItem })

                            draft.push({
                                ...responseItem,
                            })
                        }
                    )
                    setChatList(newListWithAnswer)
                    return
                }
                const newListWithAnswer = produce(
                    getChatList().filter(
                        item =>
                            item.id !== responseItem.id && item.id !== placeholderAnswerId
                    ),
                    draft => {
                        if (!draft.find(item => item.id === questionId))
                            draft.push({ ...questionItem })

                        draft.push({ ...responseItem })
                    }
                )
                setChatList(newListWithAnswer)
            },
            onMessageReplace: messageReplace => {
                setChatList(
                    produce(getChatList(), draft => {
                        const current = draft.find(item => item.id === messageReplace.id)

                        if (current) current.content = messageReplace.answer
                    })
                )
            },
            onError() {
                setRespondingFalse()
                // role back placeholder answer
                setChatList(
                    produce(getChatList(), draft => {
                        draft.splice(
                            draft.findIndex(item => item.id === placeholderAnswerId),
                            1
                        )
                    })
                )
            },
            onWorkflowStarted: ({ workflow_run_id, task_id }) => {
                responseItem.workflow_run_id = workflow_run_id
                responseItem.workflowProcess = {
                    status: WorkflowRunningStatus.Running,
                    tracing: [],
                }
                setChatList(
                    produce(getChatList(), draft => {
                        const currentIndex = draft.findIndex(
                            item => item.id === responseItem.id
                        )
                        draft[currentIndex] = {
                            ...draft[currentIndex],
                            ...responseItem,
                        }
                    })
                )
            },
            onWorkflowFinished: ({ data }) => {
                responseItem.workflowProcess!.status =
                    data.status as WorkflowRunningStatus
                setChatList(
                    produce(getChatList(), draft => {
                        const currentIndex = draft.findIndex(
                            item => item.id === responseItem.id
                        )
                        draft[currentIndex] = {
                            ...draft[currentIndex],
                            ...responseItem,
                        }
                    })
                )
            },
            onNodeStarted: ({ data }) => {
                responseItem.workflowProcess!.tracing!.push(data as any)
                setChatList(
                    produce(getChatList(), draft => {
                        const currentIndex = draft.findIndex(
                            item => item.id === responseItem.id
                        )
                        draft[currentIndex] = {
                            ...draft[currentIndex],
                            ...responseItem,
                        }
                    })
                )
            },
            onNodeFinished: ({ data }) => {
                const currentIndex = responseItem.workflowProcess!.tracing!.findIndex(
                    item => item.node_id === data.node_id
                )
                responseItem.workflowProcess!.tracing[currentIndex] = data as any
                setChatList(
                    produce(getChatList(), draft => {
                        const currentIndex = draft.findIndex(
                            item => item.id === responseItem.id
                        )
                        draft[currentIndex] = {
                            ...draft[currentIndex],
                            ...responseItem,
                        }
                    })
                )
            },
        })
    }

    // Handle feedback
    const handleFeedback = async (messageId: string, feedback: Feedbacktype) => {
        try {
            await updateFeedback({
                url: `/messages/${messageId}/feedbacks`,
                body: { rating: feedback.rating },
            })

            const newChatList = chatList.map(item => {
                if (item.id === messageId) {
                    return {
                        ...item,
                        feedback,
                    }
                }
                return item
            })
            setChatList(newChatList)

            notify({ type: 'success', message: t('common.api.success') })
        } catch (error) {
            notify({ type: 'error', message: 'Failed to update feedback' })
        }
    }

    if (appUnavailable) {
        const errorMessage = !hasSetAppConfig
            ? 'Missing environment variables: Please create a .env.local file with NEXT_PUBLIC_APP_ID and NEXT_PUBLIC_APP_KEY'
            : ''
        return (
            <AppUnavailable
                isUnknownReason={isUnknownReason}
                errMessage={errorMessage}
            />
        )
    }

    // Allow loading to continue in development bypass mode
    if (isDevelopmentBypass && promptConfig) {
        // Continue to render the main app
    } else if (!APP_ID || !APP_INFO || !promptConfig) {
        return <Loading type='app' />
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Desktop Sidebar */}
            {!isMobile && (
                <div className="w-64 flex-shrink-0">
                    <Sidebar
                        currentId={currConversationId}
                        onCurrentIdChange={handleConversationIdChange}
                        list={conversationList}
                        onNewChat={handleNewChat}
                    />
                </div>
            )}

            {/* Mobile Sidebar */}
            {isMobile && (
                <Dialog
                    open={mobileMenuOpen}
                    onClose={setMobileMenuOpen}
                    className="relative z-50 lg:hidden"
                >
                    <div className="fixed inset-0 bg-black/20" />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto">
                        <Sidebar
                            currentId={currConversationId}
                            onCurrentIdChange={handleConversationIdChange}
                            list={conversationList}
                            onNewChat={handleNewChat}
                            className="relative"
                        />
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </Dialog>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                {isMobile && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
                        <div className="w-6" /> {/* Spacer */}
                    </div>
                )}

                {/* Chat Pane */}
                <ChatPane
                    messages={chatList}
                    onSend={handleSend}
                    onFeedback={handleFeedback}
                    isResponding={isResponding}
                    className="flex-1"
                />
            </div>
        </div>
    )
}

export default Main 