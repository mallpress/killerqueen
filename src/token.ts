import { TokenType } from "./tokentype";

export class Token {
    public type: TokenType
    public value: any    
    public position: number

    constructor(type: TokenType, value: any, position: number) {
        this.type = type
        this.value = value
        this.position = position
    }
}