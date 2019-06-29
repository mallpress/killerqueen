import { Token } from "../token";
import { TokenResult } from "../tokenresult";
import { TokenType } from "../tokentype";
import { BaseTokenizer } from "./base";

export class BraceTokenizer extends BaseTokenizer {
    private brace: string

    constructor(tokenType: TokenType, brace: string) {
        super(tokenType, `Brace ${brace}`)
        this.brace = brace
    }

    public nextToken(input: string, current: number): TokenResult | null {
        if(input[current] !== this.brace) {
            return null;
        }
        return new TokenResult(1, new Token(this.tokenType, this.brace, current))
    }
}