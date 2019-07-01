/// <reference path="../../node_modules/@types/jest/index.d.ts"

import { Tokenizer } from "../tokenizer";
import { Parser } from "../parser";
import { Engine } from "../engine";

describe("Simple parser tests", () => {
    let tokenizer = new Tokenizer();
    let parser = new Parser();

    //text = text.replace(/\;/g, '\r\n')    
    it("Test basic assignment", () => {
        let text =  '$cost = 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 99}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(5)
    })
    it("Test function call", () => {
        let text =  '$cost = MAX(1, 0)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 99}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(1)
    })
    
    it("Test compound function calls", () => {
        let text =  '$cost = MAX(1, MAX(99, 5))'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(99)
    })
    
    it("Test IF true THEN", () => {
        let text =  'IF (true) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })

    it("Test IF false THEN", () => {
        let text =  'IF (false) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(102)
    })

    it("Test IF THEN ELSE", () => {
        let text =  'IF ($cost == 1) THEN $cost = 100 ELSE $cost = 99'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(99)
    })

    it("Test compound condition statement", () => {
        let text =  'IF ($cost == 1 && $cost == 2) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(2)
    })

    it("Test more complex condition statments", () => {
        let text =  'IF ($cost == 1 && $cost == 2 || true) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })

    it("Test basic aggregates", () => {
        let text =  '$cost = 1 + 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(6)
    })

    it("Test aggregate expressions as parameters", () => {
        let text =  '$cost = MAX($cost - 5, 0)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 10}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(5)
    })

    it("Test aggregate expressions as parameters with negative numbers", () => {
        let text =  '$cost = MAX(1, ABS(MIN(1, -99)) + 1)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 10}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })
})