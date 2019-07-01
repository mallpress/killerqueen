import { Token } from "./token";

export class TokenStream {
    private tokens: Token[]
    private position: number = 0
    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    public peek(count: number = 0) : Token {
        return this.tokens[this.position + count]
    }

    public consume(count: number = 1) : Token {
        let prevValue = this.position;
        this.position+= count;
        return this.tokens[prevValue]
    }

    public hasNext(count : number = 0) : boolean {
        return this.position + count < this.tokens.length
    }
}