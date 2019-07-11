import {
    stripBasename,
    parsePath,
    stripTrailingSlash,
    addLeadingSlash
} from './history-utils/PathUtils'

export function isKey(input: string | number) {
    return typeof input === 'string'
}

export function isIndex(input: string | number) {
    return typeof input === 'number'
}

export function getLocation(path: string, basename: string) {
    if (path) {
        path = stripTrailingSlash(addLeadingSlash(path))
        if (basename) {
            path = stripBasename(path, basename)
        }
        return parsePath(path)
    } else {
        return {
            pathname: '/',
            hash: '',
            search: ''
        }
    }
}

export function getHashPath() {
    const href = window.location.href
    const hashIndex = href.indexOf('#')
    return hashIndex === -1 ? '' : href.substring(hashIndex + 1)
}

export function getAbsolutePath(url: string | undefined, useHash: boolean, basename: string) {
    if (url) {
        if (useHash) {
            url =
                window.location.pathname + '#' + basename + stripTrailingSlash(addLeadingSlash(url))
        } else {
            url = basename + stripTrailingSlash(addLeadingSlash(url))
        }
    }
    return url
}
