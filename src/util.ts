export function safeParse(string) {
    try {
        return JSON.parse(string)
    } catch (err) {
        return undefined
    }
}