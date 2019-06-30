/// <reference path="../../node_modules/@types/jest/index.d.ts"

import { Tokenizer } from "../tokenizer";
import { Parser } from "../parser";
import { Engine } from "../engine";

describe("Simple parser tests", () => {
    let tokenizer = new Tokenizer();
    let parser = new Parser();

    //text = text.replace(/\;/g, '\r\n')    
    it("$cost = 5", () => {
        let text =  '$cost = 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 99}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(5)
    })
    it("$cost = MAX(1, 0)", () => {
        let text =  '$cost = MAX(1, 0)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 99}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(1)
    })
    
    it("$cost = MAX(1, MAX(99, 5))", () => {
        let text =  '$cost = MAX(1, MAX(99, 5))'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(99)
    })
    
    it("IF (true) THEN $cost = 100", () => {
        let text =  'IF (true) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })

    it("IF (true) THEN $cost = 100 ELSE $cost = 99", () => {
        let text =  'IF (true) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })

    it("IF ($cost == 1) THEN $cost = 100 ELSE $cost = 99", () => {
        let text =  'IF ($cost == 1) THEN $cost = 100 ELSE $cost = 99'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(99)
    })

    it("IF ($cost == 1 && $cost == 2) THEN $cost = 100", () => {
        let text =  'IF ($cost == 1 && $cost == 2) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(2)
    })

    it("IF ($cost == 1 && $cost == 2 || true) THEN $cost = 100", () => {
        let text =  'IF ($cost == 1 && $cost == 2 || true) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })

})