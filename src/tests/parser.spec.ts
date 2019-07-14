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
    
    it("Test boolean assignment", () => {
        let text = '$return = true NOT false'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test boolean comparison true", () => {
        let text = '$return = $true == true'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false, '$true' : true}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test boolean comparison", () => {
        let text = '$return = $false == false'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false, '$false' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test less than check", () => {
        let text = '$return = 1 < 2'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })

    it("Test greater than check", () => {
        let text = '$return = 2 > 1'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test greater than equal check", () => {
        let text = '$return = 2 >= 2 && 2 >= 1'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test less than equal check", () => {
        let text = '$return = 2 <= 2 && 1 <= 2'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test string equality check", () => {
        let text = "$return = 'a' == 'a'"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test string not equals check", () => {
        let text = "$return = 'a' != 'a'"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : true}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(false)
    })

    it("Test divide", () => {
        let text = "$return = 4 / 2"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : 9}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(2)
    })
    
    it("Test divide then multiply", () => {
        let text = "$return = 4 / 2 * 2"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : 9}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(4)
    })

    it("Test mutliply", () => {
        let text = "$return = 4 * 2"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : 9}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(8)
    })
    
    it("Test equality check of two Identifiers", () => {
        let text = "$return = isTrue == isFalse"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false, 'isTrue' : true, 'isFalse' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(false)
    })
    
    it("Test logic statement of two Identifiers", () => {
        let text = "$return = isTrue || isFalse"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false, 'isTrue' : true, 'isFalse' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test logic grouping", () => {
        let text = "$return = true && (true || false)"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test logic grouping", () => {
        let text = "$return = false || true && true"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$return' : false}
        engine.execute(ctx)
        expect(ctx['$return']).toBe(true)
    })
    
    it("Test logic grouping with mixed and and or basic", () => {
        let text = "$toReturn = true && true || false || true && ((true && false) || false)"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$toReturn' : null, a : true, b : true, c : false, d : true, e : true, f : false, g : false}
        engine.execute(ctx)
        expect(ctx['$toReturn']).toBe(true)
    })

    it("Test grouping logic for regresion of sub groups", () => {
        let text = "$toReturn = false || ((false || false) && (true && (false && true || true || true) || true) && true || true) && true"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$toReturn' : null}
        engine.execute(ctx)
        expect(ctx['$toReturn']).toBe(true)
    })

    it("Test logic grouping was for regression 1", () => {
        let text = "$toReturn = a && ((b || c) && d) || e && f"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$toReturn' : null, a : true, b : true, c : false, d : false, e : false, f : true}
        engine.execute(ctx)
        expect(ctx['$toReturn']).toBe(false)
    })

    it("Test logic grouping was for regression 2", () => {
        let text = "$toReturn = a && ((b || c) && d)"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$toReturn' : null, a : true, b : true, c : false, d : false}
        engine.execute(ctx)
        expect(ctx['$toReturn']).toBe(false)
    })
    
    it("Test logic grouping was for regression 3", () => {
        let text = "$toReturn = a || b && ((c) || d || e && (f))"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$toReturn' : null, a : false, b : true, c : false, d : true, e : true, f : false}
        engine.execute(ctx)
        expect(ctx['$toReturn']).toBe(true)
    })
    
    it("Test logic grouping another broken set", () => {
        let text = "$toReturn = true && true && (((false && (false) && (true || false || (true))) || true || false && false || false) && true && true || false)"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$toReturn' : null}
        engine.execute(ctx)
        expect(ctx['$toReturn']).toBe(true)
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
        let text = '$value = true || false'
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
        
    it("Test IF true THEN with subsequent statment", () => {
        let text = 'IF (true) THEN $cost = 100\r\n$cost = 4'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 102}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(4)
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
    
    it("Test plus equals operation", () => {
        let text = '$cost += 1'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 1}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(2)
    })

    it("Test minus equals operation", () => {
        let text = '$cost -= 1'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 1}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(0)
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

    it("Test ceiling func", () => {
        let text = '$cost = CEIL(0.5)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 10}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(1)
    })

    it("Test floor func", () => {
        let text = '$cost = FLOOR(0.5)'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$cost' : 10}
        engine.execute(ctx)
        expect(ctx['$cost']).toBe(0)
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
        let text = 'FOR ($count + 1) $i -= 1'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$i' : 0, '$count': 5}
        engine.execute(ctx)
        expect(ctx['$i']).toBe(-6)
    })

    it("Test basic for each loop", () => {
        let text = 'FOR EACH [0, 1, 2, 3] $i += $val; $i+= 2'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$i' : 0}
        engine.execute(ctx)
        expect(ctx['$i']).toBe(14)
    })

    it("Test basic for each loop", () => {
        let text = "FOR EACH ['a','b'] $i = $val"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$i' : 0}
        engine.execute(ctx)
        expect(ctx['$i']).toBe('b')
    })  

    it("Test invalid for loop parameter", () => {
        let text = "FOR EACH 'a' $i = $val"
        let tokens = tokenizer.tokenize(text);
        expect(() => parser.parse(tokens)).toThrowError()
    })  

    it("Test invalid property access", () => {
        let text = "$return = $a.1"
        let tokens = tokenizer.tokenize(text);
        expect(() => parser.parse(tokens)).toThrowError()
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
    
    it("Test array setting", () => {
        let text = '$temp[0][0] = 99'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : [[]]}
        engine.execute(ctx)
        expect(ctx['$temp'][0]).toEqual([99])
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

    it("Test object property set access multiple levels", () => {
        let text = '$temp.temp1.temp2.temp3 = 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : {'temp1' : {'temp2' : {'temp3' : 1}}}}
        engine.execute(ctx)
        expect(ctx['$temp']['temp1']['temp2']['temp3']).toBe(5)
    })

    it("Test object property set access +=", () => {
        let text = '$temp.temp += 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : {'temp' : 1}}
        engine.execute(ctx)
        expect(ctx['$temp']['temp']).toBe(6)
    })

    it("Test object property set access -=", () => {
        let text = '$temp.temp -= 5'
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : {'temp' : 1}}
        engine.execute(ctx)
        expect(ctx['$temp']['temp']).toBe(-4)
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
    
    it("Test evaluation of empty object", () => {
        let text =  "$temp = {}"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$temp' : undefined }
        engine.execute(ctx)
        ///@ts-ignore
        expect(ctx['$temp']).toEqual({})
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

    it("Test function call as operation", () => {
        let text =  "APPEND(vals, 1)"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'vals' : [1] }
        engine.execute(ctx)
        expect(ctx['vals']).toEqual([1, 1])
    })

    it("Test function with compount parameters", () => {
        let text =  "APPEND($values, {'a': 'a', 'b' : {'a' : 1}})"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$values' : [] }
        engine.execute(ctx)
        expect(ctx['$values']).toEqual([{'a': 'a', 'b' : {'a' : 1}}])
    })

    it("Test for each with function and object usage", () => {
        let text =  "FOR EACH ['test1', 'test2'] APPEND($values, {'a': $val, 'b' : {'a' : 1}})"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$values' : [] }
        engine.execute(ctx)
        expect(ctx['$values']).toEqual([{'a': 'test1', 'b' : {'a' : 1}}, {'a': 'test2', 'b' : {'a' : 1}}])
    })

    it("Test for each using variable as param", () => {
        let text =  "FOR EACH $inputs APPEND($values, {'a': $val, 'b' : {'a' : 1}})"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$inputs' : ['test1', 'test2'], '$values' : [] }
        engine.execute(ctx)
        expect(ctx['$values']).toEqual([{'a': 'test1', 'b' : {'a' : 1}}, {'a': 'test2', 'b' : {'a' : 1}}])
    })
    
    it("Test string concat", () => {
        let text =  "$a = 'a' + 'b' + 1"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$a' : null }
        engine.execute(ctx)
        expect(ctx['$a']).toBe('ab1')
    })

    it("Test tokenisation failes", () => {
        let text =  "$a = %"
        expect(() => tokenizer.tokenize(text)).toThrowError()
    })

    it("Test for bad object parsing error", () => {
        let text =  "$a = {'a'.}"
        let tokens = tokenizer.tokenize(text);
        expect(() => parser.parse(tokens)).toThrowError('')
    })

    it("Test for bad object parsing error with invalid property", () => {
        let text =  "$a = {1}"
        let tokens = tokenizer.tokenize(text);
        expect(() => parser.parse(tokens)).toThrowError()
    })
    
    it("Test for unterminted string error", () => {
        let text =  "$a = 'sdfsf"
        expect(() => tokenizer.tokenize(text)).toThrowError('unterminated string')
    })
        
    it("Test for invalid operation", () => {
        let text =  "$a"
        let tokens = tokenizer.tokenize(text);
        expect(() => parser.parse(tokens)).toThrowError('parser error, assignment expected, at position 1')
    })

    it("Test parsing decimal and evaluation", () => {
        let text =  "$a = 0.9992"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$a' : 0 }
        engine.execute(ctx)
        expect(ctx['$a']).toEqual(0.9992)
    })

    it("Test parsing negative decimal", () => {
        let text =  "$a = -0.9992"
        let tokens = tokenizer.tokenize(text);
        let ast = parser.parse(tokens);
        var engine = new Engine(ast)
        var ctx = {'$a' : 0 }
        engine.execute(ctx)
        expect(ctx['$a']).toEqual(-0.9992)
    })

    it("Test parsing conditional without THEN failing", () => {
        let text =  "IF (true) FOR EACH"
        let tokens = tokenizer.tokenize(text);
        expect(() => parser.parse(tokens)).toThrowError()
    })
    
    it("Test parsing array failing for non string / number", () => {
        let text =  "FOR EACH ['a', temp] $a = 1"
        let tokens = tokenizer.tokenize(text);
        expect(() => parser.parse(tokens)).toThrowError()
    })
    
    it("Test parsing array failing for multiple values without comma", () => {
        let text =  "FOR EACH ['a' 1] $a = 1"
        let tokens = tokenizer.tokenize(text);
        expect(() => parser.parse(tokens)).toThrowError()
    })
    
    it("Test parsing multiple decimals in a almost number", () => {
        let text =  "$a = 99..3"
        expect(() => tokenizer.tokenize(text)).toThrowError()
    })
})