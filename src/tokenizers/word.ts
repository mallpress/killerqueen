import { Token } from "../token";
import { TokenResult } from "../tokenresult";
import { TokenType } from "../tokentype";
import { BaseTokenizer } from "./base";

export class WordTokenizer extends BaseTokenizer {
    public word: String
    private static nonWordRegex: RegExp = /\W/

    constructor(tokenType: TokenType, word: String) {
        super(tokenType, `Word ${word}`)
        this.word = word.toLocaleLowerCase()
    }

    public nextToken(input: string, current: number): TokenResult | null {
        let value = ""
        for(let i = 0; i < this.word.length; i++) {
            let char = input[current + i].toLocaleLowerCase();
            if(char !== this.word[i]) {
                return null;
            }
            value += char
        }

        if(WordTokenizer.nonWordRegex.test(input[current + this.word.length])) {
            return new TokenResult(this.word.length, new Token(this.tokenType, value, current))
        }
        return null
    }
}