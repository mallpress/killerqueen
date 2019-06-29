import { PatternTokenizer } from "./tokenizers/pattern";
import { TokenType } from "./tokentype";
import { Token } from "./token";
import { BaseTokenizer } from "./tokenizers/base";
import { StringTokenizer } from "./tokenizers/string";
import { SymbolTokenizer } from "./tokenizers/symbol";
import { WordTokenizer } from "./tokenizers/word";
import { NumberTokenizer } from "./tokenizers/number";
import { IdentifierTokenizer } from "./tokenizers/identifier";
import { BraceTokenizer } from "./tokenizers/brace";

export class Tokenizer {
    private tokenizers: BaseTokenizer[]

    constructor() {
        this.tokenizers = [
            new PatternTokenizer(TokenType.WhiteSpace, "White Space", /\s/, true),
            new PatternTokenizer(TokenType.LineBreak, "Line Break", /[\\r\\n]/, false),
            new BraceTokenizer(TokenType.ParenOpen, "("),
            new BraceTokenizer(TokenType.ParenClose, ")"),
            new BraceTokenizer(TokenType.BraceOpen, "{"),
            new BraceTokenizer(TokenType.BraceClose, "}"),
            new BraceTokenizer(TokenType.SquareOpen, "["),
            new BraceTokenizer(TokenType.SquareClose, "]"),
            new NumberTokenizer(),
            new StringTokenizer(),
            new BraceTokenizer(TokenType.Comma, ","),
            new SymbolTokenizer(TokenType.NotEquals, "!="),
            new SymbolTokenizer(TokenType.Not, "!"),
            new SymbolTokenizer(TokenType.DoubleEquals, "=="),
            new SymbolTokenizer(TokenType.Equals, "="),
            new SymbolTokenizer(TokenType.LessThan, "<"),
            new SymbolTokenizer(TokenType.GreaterThan, ">"),
            new SymbolTokenizer(TokenType.GreaterThanEqual, ">="),
            new SymbolTokenizer(TokenType.LessThanEqual, "<="),
            new SymbolTokenizer(TokenType.PlusEquals, "+="),
            new SymbolTokenizer(TokenType.MinusEquals, "-="),
            new SymbolTokenizer(TokenType.Plus, "+"),
            new SymbolTokenizer(TokenType.Minus, "-"),
            new SymbolTokenizer(TokenType.SemiColon, ";"),
            new SymbolTokenizer(TokenType.Dot, "."),
            new SymbolTokenizer(TokenType.And, "&&"),
            new WordTokenizer(TokenType.And, "and"),
            new SymbolTokenizer(TokenType.Or, "||"),
            new WordTokenizer(TokenType.Or, "or"),
            new WordTokenizer(TokenType.Not, "not"),
            new WordTokenizer(TokenType.If, "if"),
            new WordTokenizer(TokenType.Then, "then"),
            new WordTokenizer(TokenType.Else, "else"),
            new WordTokenizer(TokenType.True, "true"),
            new WordTokenizer(TokenType.False, "false"),
            new WordTokenizer(TokenType.Is, "is"),
            new WordTokenizer(TokenType.In, "in"),
            new IdentifierTokenizer(),
        ];
    }

    public tokenize(input: string): Token[] {
        let toReturn = new Array<Token>()
        let currentPos = 0;
        while (currentPos < input.length) {
            let tokenized = false;
            this.tokenizers.forEach(tk => {
              if (tokenized) {return;}
              let res = tk.nextToken(input, currentPos);
              if(res) {
                tokenized = true;
                currentPos += res.consumedChar;
                if(!res.skip) toReturn.push(res.token)
              }
            });
            if (!tokenized) {
              throw new TypeError('I dont know what this character is: ' + input[currentPos]);
            }
          }

        return toReturn
    }
}
