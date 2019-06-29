import { Token } from "../token";
import { TokenResult } from "../tokenresult";
import { TokenType } from "../tokentype";
import { BaseTokenizer } from "./base";

export class SymbolTokenizer extends BaseTokenizer {
    public symbol: String
    private static nonSymbolRegex: RegExp = /([a-z0-9]|\(|\)|\{|\}|\s)/i

    constructor(tokenType: TokenType, symbol: String) {
        super(tokenType, `Symbol ${symbol}`)
        this.symbol = symbol
    }

    public nextToken(input: string, current: number): TokenResult | null {
        // a symbol cannot be at the end of a input string
        if(input.length < current + this.symbol.length + 1) return null
        let value = ""
        for(let i = 0; i < this.symbol.length; i++) {
            if(input[current + i] !== this.symbol[i]) {
                return null;
            }
            value += input[current + i]
        }

        if(SymbolTokenizer.nonSymbolRegex.test(input[current + this.symbol.length])) {
            return new TokenResult(this.symbol.length, new Token(this.tokenType, value, current))
        }
        return null
    }
}