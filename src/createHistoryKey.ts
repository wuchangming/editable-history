let keyLength = 8
export default function createHistoryKey() {
    return Math.random()
        .toString(36)
        .substr(2, keyLength)
}
