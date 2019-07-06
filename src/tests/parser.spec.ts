/// <reference path="../../node_modules/@types/jest/index.d.ts"

import { Tokenizer } from "../tokenizer";
import { Parser } from "../parser";
import { Engine } from "../engine";

describe("Simple parser tests", () => {
    let tokenizer = new Tokenizer();
    let parser = new Parser();

    //text = text.replace(/\;/g, '\r\n')    
    it("Test basic assignment", () => {
        let text = '$cost = 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 99}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(5)
    })
    
    it("Test boolean assignment statment", () => {
        let text = '$value = true'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$value' : 99}
        engine.execute(ctx)
        expect(ctx['$value']).toBe(true)
    })
        
    it("Test boolean assignment statment with bool operator", () => {
        let text = '$value = true && false'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$value' : 99}
        engine.execute(ctx)
        expect(ctx['$value']).toBe(true)
    })

    it("Test function call", () => {
        let text = '$cost = MAX(1, 0)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 99}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(1)
    })
    
    it("Test compound function calls", () => {
        let text = '$cost = MAX(1, MAX(99, 5))'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(99)
    })
        
    it("Test compound function calls", () => {
        let text = '$cost = MAX(el.apples, 5)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102, 'el' : {'apples' : 40}}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(40)
    })
    
    it("Test IF true THEN", () => {
        let text = 'IF (true) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })

    it("Test IF false THEN", () => {
        let text = 'IF (false) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(102)
    })

    it("Test IF THEN ELSE", () => {
        let text = 'IF ($cost == 1) THEN $cost = 100 ELSE $cost = 99'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(99)
    })

    it("Test compound condition statement", () => {
        let text = 'IF ($cost == 1 && $cost == 2) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(2)
    })

    it("Test more complex condition statments", () => {
        let text = 'IF ($cost == 1 && $cost == 2 || true) THEN $cost = 100'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })

    it("Test basic aggregates", () => {
        let text = '$cost = 1 + 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 2}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(6)
    })

    it("Test aggregate expressions as parameters", () => {
        let text = '$cost = MAX($cost - 5, 0)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 10}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(5)
    })

    it("Test aggregate expressions as parameters with negative numbers", () => {
        let text = '$cost = MAX(1, ABS(MIN(1, -99)) + 1)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 10}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(100)
    })

    it("Test basic for loop with itterations", () => {
        let text = 'FOR (10) $i += 1'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$i' : 0}
        engine.execute(ctx)
        expect(ctx['$i']).toBe(10)
    })

    it("Test basic for loop with itterations using expression", () => {
        let text = 'FOR ($count + 1) $i += 1'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$i' : 0, '$count': 5}
        engine.execute(ctx)
        expect(ctx['$i']).toBe(6)
    })

    it("Test basic for each loop", () => {
        let text = 'FOR EACH [0, 1, 2, 3] $i += $val'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$i' : 0}
        engine.execute(ctx)
        expect(ctx['$i']).toBe(6)
    })

    it("Test basic for each loop", () => {
        let text = 'FOR EACH [\'a\',\'b\'] $i = $val'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$i' : 0}
        engine.execute(ctx)
        expect(ctx['$i']).toBe('b')
    })
    
    it("Test array access", () => {
        let text = '$temp = a.b[0][0]'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : null, 'a' : {'b' : [[55]]}}
        engine.execute(ctx)
        expect(ctx['$temp']).toBe(55)
    })

    it("Test object property set access", () => {
        let text = '$temp.temp = 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : {'temp' : 1}}
        engine.execute(ctx)
        expect(ctx['$temp']['temp']).toBe(5)
    })

    it("Test evaluation of object", () => {
        let text =  "$temp = {'a' : 1 }"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : undefined }
        engine.execute(ctx)
        ///@ts-ignore
        expect(ctx['$temp']['a']).toBe(1)
    })

    
    it("Test evaluation of nested object", () => {
        let text =  "$temp = {'a' : {'a' : 2}}"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : undefined }
        engine.execute(ctx)
        ///@ts-ignore
        expect(ctx['$temp']['a']).toEqual({'a' : 2})
    })
})