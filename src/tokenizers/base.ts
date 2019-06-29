import { TokenResult } from "../tokenresult";
import { TokenType } from "../tokentype";

export abstract class BaseTokenizer {
    public name: string
    protected tokenType: TokenType
    constructor(tokenType: TokenType, name: string) {
        this.tokenType = tokenType
        this.name = name
    }

    public abstract nextToken(input: string, current: number): TokenResult | null;
}