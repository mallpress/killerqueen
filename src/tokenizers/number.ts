import { Token } from "../token";
import { TokenResult } from "../tokenresult";
import { TokenType } from "../tokentype";
import { BaseTokenizer } from "./base";

export class NumberTokenizer extends BaseTokenizer {
    private static validStarts: RegExp = /[\-0-9]/
    private static numberCheck: RegExp = /[0-9]/
    private static nonNumberCheck: RegExp = /[\s\W\w]/

    constructor() {
        super(TokenType.Number, "Number")
    }

    public nextToken(input: string, current: number): TokenResult | null {
        let firstChar = input[current];

        if(!NumberTokenizer.validStarts.test(firstChar)) return null;

        let tempPos = current;

        let multiplier = 1;
        let numberStarted = false;
        let currentValue = "";
        let foundDecimal = false;

        let length = 0;

        if(NumberTokenizer.numberCheck.test(firstChar)) {
            numberStarted = true;
        } else {
            multiplier = -1;
            tempPos++;
            length++;
        }
        
        while(tempPos < input.length) {
            let char = input[tempPos]
            if(NumberTokenizer.numberCheck.test(char)) {
                currentValue += char
                length++;
            } else if(char === '.') {
                // two decimals ..... not our thing
                if(foundDecimal) {
                    return null;
                }
                foundDecimal = true;
                currentValue += "."
                length++;
            } else if(NumberTokenizer.nonNumberCheck.test(char)) {
                break;
            }
            tempPos++;
        }
        try {
            let value = parseFloat(currentValue) * multiplier
            return new TokenResult(length, new Token(TokenType.Number, value, current))
        } catch(e) {
            return null
        }
    }
}