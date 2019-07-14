import deepEqual from 'deep-equal'
import { createHistoryKey, isEditableHistoryState } from './utils'
import { isKey, isIndex, getLocation, getHashPath, getAbsolutePath } from './utils'
import { stripTrailingSlash, addLeadingSlash } from './history-utils/PathUtils'

const PopStateEvent = 'popstate'
const rawHistory = window.history

type ScreenStateObject = {
    k: string //history key
    s: unknown // business state
    l: string // `window.location.href` or `hash`
}

type HistoryState = {
    eh_ck: string // current key
    eh_sl: ScreenStateObject[] // screen state list
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
    private historyState: HistoryState
    private basename = ''
    private useHash = false
    constructor({ basename = '', initState, useHash = false }: HistoryEditorProps) {
        this.basename = basename ? stripTrailingSlash(addLeadingSlash(basename)) : ''
        this.useHash = useHash
        window.addEventListener(PopStateEvent, this.handlerRawHistoryState)

        if (isEditableHistoryState(rawHistory.state)) {
            this.historyState = rawHistory.state
        } else {
            const historyKey = createHistoryKey()
            rawHistory.replaceState(
                {
                    historyKey,
                    state: initState
                },
                ''
            )

            const newHistoryState = {
                eh_ck: historyKey,
                eh_sl: [
                    {
                        k: historyKey,
                        s: initState,
                        l: this.useHash ? getHashPath() : window.location.href
                    }
                ]
            }
            this.historyState = newHistoryState
        }
    }

    predictionAction?: {
        key: string
        cb?: Function
    }

    indexOf = (keyOrIndex: string | number): number => {
        if (isKey(keyOrIndex)) {
            return this.historyState.eh_sl.findIndex(stateObject => {
                return stateObject.k === keyOrIndex
            })
        } else if (isIndex(keyOrIndex)) {
            if (this.historyState.eh_sl[keyOrIndex as number]) {
                return keyOrIndex as number
            } else {
                return -1
            }
        } else {
            return -1
        }
    }

    indexOfActive = () => {
        return this.historyState.eh_sl.findIndex(stateObject => {
            return stateObject.k === this.historyState.eh_ck
        })
    }

    handlerRawHistoryState = (ev: PopStateEvent) => {
        const { eh_ck = undefined, eh_sl = undefined } = ev.state || {}
        if (this.predictionAction && this.predictionAction.key === eh_ck) {
            const cb = this.predictionAction.cb
            this.predictionAction = undefined
            if (typeof cb === 'function') {
                cb()
            }
        } else {
            if (isEditableHistoryState(ev.state)) {
                if (!deepEqual(this.historyState.eh_sl, eh_sl)) {
                    rawHistory.replaceState(this.historyState, '')
                    this.historyState.eh_sl = eh_sl
                }
                this.historyState.eh_ck = eh_ck
            } else {
                const newHistoryKey = createHistoryKey()

                const newStateList = this.historyState.eh_sl.splice(
                    this.indexOfActive() + 1,
                    this.historyState.eh_sl.length - this.indexOfActive()
                )
                newStateList.push({
                    k: newHistoryKey,
                    s: undefined,
                    l: this.useHash ? getHashPath() : window.location.pathname
                })
                const newHistoryState = {
                    eh_ck,
                    eh_sl: newStateList
                }
                rawHistory.replaceState(newHistoryKey, '')
                this.historyState = newHistoryState
            }
        }
    }

    stepProcessor = (targetIndex: number, cb?: Function) => {
        targetIndex = this.indexOf(targetIndex)
        const activeIndex = this.indexOfActive()
        if (targetIndex !== activeIndex && targetIndex > -1) {
            const predictionKey = this.historyState.eh_sl[targetIndex].k
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
            const newStateList = this.historyState.eh_sl.splice(
                targetIndex + 1,
                this.historyState.eh_sl.length - targetIndex
            )

            const newHistoryState = {
                eh_ck: historyKey,
                eh_sl: newStateList
            }

            rawHistory.pushState(newHistoryState, '', absoluteUrl)

            this.historyState = newHistoryState
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
            this.historyState.eh_sl.forEach((stateObject, index) => {
                if (index === targetIndex) {
                    stateObject.k = historyKey
                    stateObject.l = absoluteUrl
                    stateObject.s = state
                }
            })

            const newHistoryState = {
                eh_ck: historyKey,
                eh_sl: this.historyState.eh_sl
            }

            rawHistory.replaceState(newHistoryState, '', absoluteUrl)
            this.historyState = newHistoryState
        })
    }

    active = (keyOrIndex: string | number) => {
        const targetIndex = this.indexOf(keyOrIndex)
        if (targetIndex < 0) {
            console.warn(`[active]: \`keyOrIndex\`=${keyOrIndex} is out of range'`)
            return
        }
        this.stepProcessor(targetIndex, () => {
            this.historyState.eh_ck = this.historyState.eh_sl[targetIndex].k
        })
    }

    get historyList() {
        return undefined
    }
}
