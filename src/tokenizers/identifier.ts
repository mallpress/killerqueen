import { Token } from "../token";
import { TokenResult } from "../tokenresult";
import { TokenType } from "../tokentype";
import { BaseTokenizer } from "./base";

export class IdentifierTokenizer extends BaseTokenizer {
    private static validStarts: RegExp = /[a-z\\$]/i
    private static validName: RegExp = /[0-9a-z\\$]/i

    constructor() {
        super(TokenType.Identifier, "Identifier")
    }

    public nextToken(input: string, current: number): TokenResult | null {
        let firstChar = input[current];

        if(!IdentifierTokenizer.validStarts.test(firstChar)) return null;

        let tempPos = current;
        let currentValue = "";
       
        while(tempPos < input.length) {
            let char = input[tempPos]
            if(IdentifierTokenizer.validName.test(char)) {
                currentValue += char
            } else if(!IdentifierTokenizer.validName.test(char)) {
                return new TokenResult(currentValue.length, new Token(TokenType.Identifier, currentValue, current))
            }
            tempPos++;
        }        
        return null
    }
}