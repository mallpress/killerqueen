import { Token } from "../token";
import { TokenResult } from "../tokenresult";
import { TokenType } from "../tokentype";
import { BaseTokenizer } from "./base";

export class PatternTokenizer extends BaseTokenizer {
    private regex: RegExp
    private skip: boolean
    constructor(tokenType: TokenType, name: string, regex: RegExp, skip: boolean = false) {
        super(tokenType, name)
        this.tokenType = tokenType
        this.name = name
        this.regex = regex
        this.skip = skip
    }

    public nextToken(input: string, current: number): TokenResult | null {
        let currentChar = input[current]
        let consumed = 0;
        if(this.regex.test(currentChar)) {
            let currentValue = "";
            while (currentChar && this.regex.test(currentChar)) {
                currentValue += currentChar;
                consumed++;
                currentChar = input[current + consumed];
            }
            return new TokenResult(consumed, new Token(this.tokenType, currentValue, current), this.skip)
        }
        return null
    }
}