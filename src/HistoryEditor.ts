import createHistoryKey from './createHistoryKey'
import { isKey, isIndex, getLocation, getHashPath, getAbsolutePath } from './utils'
import { stripTrailingSlash, addLeadingSlash } from './history-utils/PathUtils'

const PopStateEvent = 'popstate'
const rawHistory = window.history

export type historyObject = {
    isActive: boolean
    historyKey: string
    state: unknown
    location: unknown
}

type HistoryEditorProps = {
    basename?: string
    initState?: unknown
    useHash: boolean
}

type PushParams = {
    state?: unknown
    url?: string
    keyOrIndex?: string | number
}

type ReplaceParams = {
    state?: unknown
    url?: string
    keyOrIndex?: string | number
}

export class HistoryEditor {
    private rawHistoryList: historyObject[] = []
    private basename = ''
    private useHash = false
    constructor({ basename = '', initState, useHash = false }: HistoryEditorProps) {
        this.basename = basename ? stripTrailingSlash(addLeadingSlash(basename)) : ''
        this.useHash = useHash
        window.addEventListener(PopStateEvent, this.handlerRawHistoryState)

        const { historyKey = undefined, state = undefined } = rawHistory.state || {}
        if (isKey(historyKey)) {
            this.rawHistoryList.push({
                historyKey,
                state,
                isActive: true,
                location: getLocation(
                    this.useHash ? getHashPath() : window.location.pathname,
                    this.basename
                )
            })
        } else {
            const historyKey = createHistoryKey()
            rawHistory.replaceState(
                {
                    historyKey,
                    state: initState
                },
                ''
            )
            this.rawHistoryList.push({
                historyKey,
                state: initState,
                isActive: true,
                location: getLocation(
                    this.useHash ? getHashPath() : window.location.pathname,
                    this.basename
                )
            })
        }
    }

    predictionAction?: {
        key: string
        cb?: Function
    }

    indexOf = (keyOrIndex: string | number): number => {
        if (isKey(keyOrIndex)) {
            return this.rawHistoryList.findIndex(historyObject => {
                return historyObject.historyKey === keyOrIndex
            })
        } else if (isIndex(keyOrIndex)) {
            if (this.rawHistoryList[keyOrIndex as number]) {
                return keyOrIndex as number
            } else {
                return -1
            }
        } else {
            return -1
        }
    }

    indexOfActive = () => {
        return this.historyList.findIndex(history => {
            return history.isActive
        })
    }

    handlerRawHistoryState = (ev: PopStateEvent) => {
        const { historyKey = undefined, state = undefined } = ev.state || {}
        if (this.predictionAction && this.predictionAction.key === historyKey) {
            const cb = this.predictionAction.cb
            this.predictionAction = undefined
            if (typeof cb === 'function') {
                cb()
            }
        } else {
            if (isKey(historyKey)) {
                if (this.indexOf(historyKey) > -1) {
                    this.rawHistoryList.forEach(historyObject => {
                        if (historyObject.historyKey === historyKey) {
                            historyObject.isActive = true
                        } else {
                            historyObject.isActive = false
                        }
                    })
                } else {
                    this.rawHistoryList.forEach(historyObject => {
                        historyObject.isActive = false
                    })
                    this.rawHistoryList.push({
                        historyKey,
                        state,
                        isActive: true,
                        location: getLocation(
                            this.useHash ? getHashPath() : window.location.pathname,
                            this.basename
                        )
                    })
                }
            } else {
                const newHistoryKey = createHistoryKey()
                rawHistory.replaceState(
                    {
                        historyKey: newHistoryKey
                    },
                    ''
                )
                this.rawHistoryList.splice(
                    this.indexOfActive() + 1,
                    this.rawHistoryList.length - this.indexOfActive()
                )
                this.rawHistoryList.forEach(historyObject => {
                    historyObject.isActive = false
                })
                this.rawHistoryList.push({
                    historyKey: newHistoryKey,
                    state: undefined,
                    isActive: true,
                    location: getLocation(
                        this.useHash ? getHashPath() : window.location.pathname,
                        this.basename
                    )
                })
            }
        }
    }

    stepProcessor = (targetIndex: number, cb?: Function) => {
        targetIndex = this.indexOf(targetIndex)
        const activeIndex = this.indexOfActive()
        if (targetIndex !== activeIndex && targetIndex > -1) {
            const predictionKey = this.historyList[targetIndex].historyKey
            this.predictionAction = {
                key: predictionKey,
                cb
            }
            rawHistory.go(targetIndex - activeIndex)
        } else {
            if (typeof cb === 'function') {
                cb()
            }
        }
    }

    push = (params: PushParams = {}) => {
        const { state, url, keyOrIndex = this.indexOfActive() } = params
        let targetIndex = this.indexOf(keyOrIndex)
        if (targetIndex < 0) {
            console.warn(`[push]: \`keyOrIndex\`=${keyOrIndex} is out of range'`)
            return
        }
        const historyKey = createHistoryKey()

        const absoluteUrl = getAbsolutePath(url, this.useHash, this.basename)

        this.stepProcessor(targetIndex, () => {
            rawHistory.pushState(
                {
                    historyKey,
                    state
                },
                '',
                absoluteUrl
            )
            this.rawHistoryList.splice(targetIndex + 1, this.rawHistoryList.length - targetIndex)

            this.rawHistoryList.forEach(historyObject => {
                historyObject.isActive = false
            })

            this.rawHistoryList.push({
                isActive: true,
                historyKey,
                state,
                location: url
                    ? getLocation(url || '', '')
                    : this.rawHistoryList[this.rawHistoryList.length - 1]
            })
        })
        return historyKey
    }

    replace = (params: ReplaceParams) => {
        const { state, url, keyOrIndex = this.indexOfActive() } = params
        let targetIndex = this.indexOf(keyOrIndex)
        if (targetIndex < 0) {
            console.warn(`[replace]: \`keyOrIndex\`=${keyOrIndex} is out of range'`)
            return
        }
        const historyKey = createHistoryKey()
        const absoluteUrl = getAbsolutePath(url, this.useHash, this.basename)

        this.stepProcessor(targetIndex, () => {
            rawHistory.replaceState(
                {
                    historyKey,
                    state
                },
                '',
                absoluteUrl
            )
            this.rawHistoryList.forEach((historyObject, index) => {
                if (index === targetIndex) {
                    historyObject.historyKey = historyKey
                    historyObject.isActive = true
                    historyObject.location = url
                        ? getLocation(url || '', '')
                        : historyObject.location
                    historyObject.state = state
                }
            })
        })
    }

    active = (keyOrIndex: string | number) => {
        const targetIndex = this.indexOf(keyOrIndex)
        if (targetIndex < 0) {
            console.warn(`[active]: \`keyOrIndex\`=${keyOrIndex} is out of range'`)
            return
        }
        this.stepProcessor(targetIndex, () => {
            this.rawHistoryList.forEach((historyObject, index) => {
                if (index === targetIndex) {
                    historyObject.isActive = true
                } else {
                    historyObject.isActive = false
                }
            })
        })
    }

    get historyList() {
        return this.rawHistoryList
    }
}
