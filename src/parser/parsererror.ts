export class ParserError extends Error {
    constructor(message: string, position: number) {
        super(`${message}, at position ${position + 1}`)
    }
}