import { Token } from "./token";

export class TokenResult {
    public consumedChar: number;
    public token: Token    
    public skip: boolean
    public constructor(consumedChar: number, token: Token, skip: boolean = false) {
        this.consumedChar = consumedChar
        this.token = token
        this.skip = skip
    }
}