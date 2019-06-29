/// <reference path="../../node_modules/@types/jest/index.d.ts"

import { Tokenizer } from "../tokenizer";
import { Parser } from "../parser";
import { Branch } from "../ast/branch";
import { Engine } from "../engine";

describe("Simple parser tests", () => {
    let tokenizer = new Tokenizer();
    let parser = new Parser();

    it("$cost = MAX(el.pressure, 0)", () => {
        let text = `$cost = 2`
        let tokens = tokenizer.tokenize(text);
        console.log(tokens);
        let ast = parser.parse(tokens);
        console.log(ast)

        var engine = new Engine(ast)
        var ctx = {'$cost' : 0}
        engine.execute(ctx)
        console.log(ctx)

    })

})