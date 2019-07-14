import { Token } from "../token";
import { TokenType } from "../tokentype";
import { BooleanOperator } from "../ast/booleanoperator";
import { BooleanExpression } from "../ast/booleanexpression";
import { Sequence } from "../ast/sequence";
import { Operation } from "../ast/operation";
import { ParserError } from "./parsererror";
import { Branch } from "../ast/branch";
import { TokenStream } from "../tokenstream";
import { Node } from "../ast/node";
import { BinaryOperator } from "../ast/enums/binaryoperator";
import { BooleanExpressionGroup } from "../ast/booleanexpressiongroup";
import { NodeType } from "../ast/nodetype";
import { Identifier } from "../ast/identifier";
import { PropertyAccess } from "../ast/propertyaccess";
import { AssignmentOperator } from "../ast/enums/assignmentoperator";
import { StringLiteral } from "../ast/stringliteral";
import { NumericLiteral } from "../ast/numericliteral";
import { BooleanLiteral } from "../ast/booleanliteral";
import { FunctionCall } from "../ast/functioncall";
import { Aggregate } from "../ast/aggregate";
import { MathematicalOperator } from "../ast/enums/mathematicaloperator";
import { ForLoop } from "../ast/forloop";
import { IndexAccess } from "../ast/indexaccess";
import { ObjectNode } from "../ast/objectnode";
import { ObjectProperty } from "../ast/objectproperty";
import { ForLoopType } from "../ast/enums/forlooptype";
import { StringConcatenation } from "../ast/stringconcatenation";

export class Parser {
    constructor() {

    }

    public parse(tokens: Token[]) {
        let stream = new TokenStream(tokens);
        let sequence = new Sequence()
        while (stream.hasNext()) {
            let currentToken = stream.peek();
            switch (currentToken.type) {
                case TokenType.If:
                    sequence.nodes.push(this.parseIfStatement(stream))
                    break;
                case TokenType.Identifier:
                    sequence.nodes.push(this.parseOperation(stream))
                    break;
                case TokenType.For:
                    sequence.nodes.push(this.parseForLoop(stream))
                // we can skip multi line breaks
                case TokenType.LineBreak:
                    break;
            }
        }
        return sequence
    }

    //#region Conditionals

    private parseIfStatement(stream : TokenStream) : Node {
        // we will always get the 'IF'
        stream.consume();
        let conds = this.parseBooleanExpressions(stream)
        let currentToken = stream.consume()
        if(currentToken.type !== TokenType.Then) {
            throw new ParserError(`could not parse conditional expected THEN expected, got ${currentToken.value}`, currentToken.position)
        }
        let branch = new Branch(conds, this.parseOperations(stream));

        // user only needs to specify 'IF x THEN y' if they want        
        if(!stream.hasNext())  return branch;

        if(stream.peek().type !== TokenType.Else) return branch;
        stream.consume()
        
        branch.condFalseBody = this.parseOperations(stream)

        return branch
    }

    private parseBooleanExpressions(stream: TokenStream, parenOpen: number = 0): Node {
        let prevNode: Node | null = null
        let finished = false
        let prevInGroup = false;
        while (stream.hasNext() && !finished) {
            let currentToken = stream.peek();
            switch (currentToken.type) {
                case TokenType.Or:
                case TokenType.And:
                case TokenType.Not:
                    stream.consume()
                    let operator = BinaryOperator.And;
                    switch (currentToken.type) {
                        case TokenType.Or:
                            operator = BinaryOperator.Or;
                            break;
                        case TokenType.And:
                            operator = BinaryOperator.And;
                            break;
                        case TokenType.Not:
                            operator = BinaryOperator.Not;
                            break;
                    }
                    if (!prevNode) throw new ParserError(`${currentToken.value} found, with nothing preceeding`, currentToken.position)
                    let newGroup = new BooleanExpressionGroup(prevNode)
                    newGroup.operator = operator
                    let nextToken = stream.peek()
                    if (!nextToken) throw new ParserError(`${currentToken.value} found, with nothing after it`, currentToken.position)

                    let newCond = null;

                    if (nextToken.type === TokenType.ParenOpen) {
                        stream.consume()
                        parenOpen++
                        prevInGroup = false;
                        newCond = this.parseBooleanExpressions(stream, parenOpen);
                    } else {
                        newCond = this.parseBooleanExpression(stream)
                    }
                    // need to handle the case of A || B && C, so we steal B
                    // from the previous group and create a new group with B as left and set
                    // the previous group's right to the new group this gives up A || (B && C)
                    // this should only be done if the previous expression was not
                    // in brackets, as that should be treated as fixeds
                    if (!prevInGroup && currentToken.type === TokenType.And && prevNode.nodeType == NodeType.BooleanExpressionGroup) {
                        let prevGroup = prevNode as BooleanExpressionGroup;
                        let newLeft = prevGroup.right as Node;
                        newGroup = new BooleanExpressionGroup(newLeft)
                        newGroup.operator = operator
                        newGroup.right = newCond
                        prevGroup.right = newGroup
                        newGroup = prevGroup
                    } else {
                        // if it was just a condition we can continue on as planned
                        newGroup.right = newCond
                    }
                    prevNode = newGroup as Node
                    break;
                case TokenType.ParenOpen:
                    parenOpen++;
                    stream.consume()
                    prevNode = this.parseBooleanExpressions(stream, parenOpen);
                    prevInGroup = true;
                    break;
                case TokenType.ParenClose:
                    parenOpen--;
                    stream.consume()
                    finished = true
                    if (parenOpen < 0) throw new ParserError("mismattched parentheses, unexpected ')'", currentToken.position)
                    break;
                case TokenType.Then:
                    finished = true;
                    break;
                default:
                    prevNode = this.parseBooleanExpression(stream)
                    prevInGroup = false
                    break;
            }
        }
        return prevNode!
    }

    private parseBooleanExpression(stream: TokenStream): BooleanExpression | BooleanLiteral | Identifier | PropertyAccess {
        let operator = BooleanOperator.DoubleEquals
        let currentToken = stream.peek()
        let left = null;
        let right = null;
        switch (currentToken.type) {
            case TokenType.String:
                stream.consume()
                left = new StringLiteral(currentToken.value)
                break;
            case TokenType.Number:
                stream.consume()
                left = new NumericLiteral(currentToken.value)
                break;
            case TokenType.True:
                stream.consume()
                return new BooleanLiteral(true)
            case TokenType.False:
                stream.consume()
                return new BooleanLiteral(false)
            case TokenType.Identifier:
                left = this.parseReference(stream)
                break
            default:
                throw new ParserError(`parse error, conditional type expected, found ${currentToken.value}`, currentToken.position)
        }

        if(!stream.hasNext()) return left as Identifier

        let nextToken = stream.peek()

        switch (nextToken.type) {
            case TokenType.DoubleEquals:
                operator = BooleanOperator.DoubleEquals
                break;
            case TokenType.LessThan:
                operator = BooleanOperator.LessThan
                break;
            case TokenType.GreaterThan:
                operator = BooleanOperator.GreaterThan
                break;
            case TokenType.LessThanEqual:
                operator = BooleanOperator.LessThanEqual
                break;
            case TokenType.GreaterThanEqual:
                operator = BooleanOperator.GreaterThanEqual
                break;
            case TokenType.NotEquals:
                operator = BooleanOperator.NotEquals
                break;
            case TokenType.In:
                operator = BooleanOperator.In
                break
            case TokenType.And:
            case TokenType.Or:
            case TokenType.Not:
            case TokenType.ParenClose:
                // we play it a bit fast or loose here as the user can
                // have something like 1 || false .... which JS will handle 
                // should we handle? TODO: Think about this
                ///@ts-ignore
                return left
            default:
                throw new ParserError(`parse error, boolean operator expected, found ${nextToken.value}`, nextToken.position)
        }
        stream.consume()

        currentToken = stream.peek();
        switch (currentToken.type) {
            case TokenType.String:
                stream.consume()
                right = new StringLiteral(currentToken.value)
                break;
            case TokenType.Number:
                stream.consume()
                right = new NumericLiteral(currentToken.value)
                break;
            case TokenType.True:
                stream.consume()
                right = new BooleanLiteral(true)
                break;
            case TokenType.False:
                stream.consume()
                right = new BooleanLiteral(false)
                break;
            case TokenType.Identifier:
                    right = this.parseReference(stream)
                break
            default:
                throw new ParserError(`parse error, conditional type expected, found ${currentToken.value}`, currentToken.position)
        }

        return new BooleanExpression(left, operator, right);
    }

    //#endregion

    //#region Operations

    private parseOperations(stream: TokenStream): Sequence {
        let seq = new Sequence()
        while (stream.hasNext()) {
            let op = this.parseOperation(stream)
            seq.nodes.push(op)
            if (!stream.hasNext()) break;
            let nextToken = stream.peek()
            if (!stream.hasNext() || nextToken.type !== TokenType.SemiColon) {
                break;
            }
            stream.consume();
        }
        return seq;
    }

    private parseOperation(stream: TokenStream): Operation | FunctionCall {
        let nextToken = stream.peek(1)
        if(stream.hasNext(1) && nextToken.type === TokenType.ParenOpen) {
            return this.parseFunctionCall(stream)
        }
        let ref = this.parseReference(stream)

        if(!stream.hasNext()) throw new ParserError(`parser error, assignment expected`, 0)

        let currentToken = stream.consume()

        let operator = AssignmentOperator.Equals;

        switch(currentToken.type) {
            case TokenType.Equals:
                break;
            case TokenType.MinusEquals:
                operator = AssignmentOperator.MinusEquals
                break;
            case TokenType.PlusEquals:
                operator = AssignmentOperator.PlusEquals
                break;
            default:
                throw new ParserError(`parser error, assignment operator expected, found ${currentToken.value}`, currentToken.position)
        }

        return new Operation(ref, operator, this.parseExpression(stream))
    }

    private parseExpression(stream : TokenStream) : Node {
        let currentToken = null
        let toReturn = null
        let currentExpression = null
        while(stream.hasNext()) {
            currentToken = stream.peek()
            let startPosition = stream.getPosition()
            switch(currentToken.type) {
                case TokenType.String:
                    toReturn = this.parseString(stream)
                    break;
                case TokenType.Number:
                    stream.consume()
                    toReturn = new NumericLiteral(currentToken.value)
                    break;
                case TokenType.True:
                case TokenType.False:
                    stream.consume()
                    toReturn = new BooleanLiteral(currentToken.type === TokenType.True ? true : false)
                    break;
                case TokenType.Identifier:
                    let nextToken = stream.peek(1)
                    if(stream.hasNext(1) && nextToken.type === TokenType.ParenOpen) {
                        toReturn = this.parseFunctionCall(stream)
                    }
                    else {
                        toReturn = this.parseReference(stream)
                    }
                    break;
                case TokenType.BraceOpen:
                    toReturn = this.parseObject(stream)
                    break;
                default:
                    throw new ParserError(`parser error, expression, found ${currentToken.value}`, currentToken.position)
            }
            if(!stream.hasNext()) break;
            currentToken = stream.peek()
            switch(currentToken.type) {
                case TokenType.Plus:
                case TokenType.Minus:
                case TokenType.Multiply:
                case TokenType.Divide:
                    let operator = MathematicalOperator.Plus
                    switch(currentToken.type) {
                        case TokenType.Plus:
                            operator = MathematicalOperator.Plus
                            break;
                        case TokenType.Minus:
                            operator = MathematicalOperator.Minus
                            break;
                        case TokenType.Multiply:
                            operator = MathematicalOperator.Multiply
                            break;
                        case TokenType.Divide:
                            operator = MathematicalOperator.Divide
                            break;
                    }
                    stream.consume()
                    // so we can handle multiple together 1 + 2 + 3
                    if(currentExpression !== null) {
                        let newExp = new Aggregate(toReturn, operator)
                        currentExpression.right = newExp
                        currentExpression = newExp
                    }
                    else {
                        currentExpression = new Aggregate(toReturn, operator)
                    }
                    continue
                case TokenType.And:
                case TokenType.Or:
                case TokenType.Not:
                case TokenType.DoubleEquals:
                case TokenType.LessThan:
                case TokenType.LessThanEqual:
                case TokenType.GreaterThan:
                case TokenType.GreaterThanEqual:
                case TokenType.NotEquals:
                    // if it is actually a conditional we need to parse it as one
                    stream.setPosition(startPosition)
                    return this.parseBooleanExpressions(stream)
                default:
                    if(currentExpression !== null) {
                        currentExpression.right = toReturn
                        return currentExpression
                    }
                    else {
                        return toReturn
                    }
            }
        }
        if(toReturn === null) throw new ParserError(`parser error, expression expected, found ${currentToken!.value}`, currentToken!.position)
        if(currentExpression !== null) {
            currentExpression.right = toReturn
            return currentExpression
        }
        return toReturn
    }

    private parseString(stream : TokenStream) : StringConcatenation | StringLiteral {
        let nextToken = stream.consume()
        let stringLit = new StringLiteral(nextToken.value)
        nextToken = stream.peek()
        if(nextToken.type !== TokenType.Plus) return stringLit
        let concat = new StringConcatenation()
        concat.nodes.push(stringLit)
        while(stream.hasNext(1)) {
            if(nextToken.type !== TokenType.Plus) return concat
            nextToken = stream.peek(1)
            switch(nextToken.type) {
                case TokenType.String:
                case TokenType.Number:
                case TokenType.True:
                case TokenType.False:
                    stream.consume(2)
                    concat.nodes.push(new StringLiteral(nextToken.value))
                    break;
                case TokenType.Identifier:
                    stream.consume(1)
                    concat.nodes.push(this.parseReference(stream))
                    break;
                default:
                    throw new ParserError(`parser error, string concatenation expected, found ${nextToken.value}`, nextToken.position)
            }
            nextToken = stream.peek()
        }
        return concat
    }

    private parseReference(stream : TokenStream) : Identifier | PropertyAccess {
        let nextToken = stream.consume()
        let ident = new Identifier(nextToken.value)
        if(!stream.hasNext()) return ident

        nextToken = stream.peek()
        let subReferences : Node[] = []
        let continueSearch = true;
        while(continueSearch && stream.hasNext()) {
            switch(nextToken.type) {
                case TokenType.Dot:
                    stream.consume()
                    nextToken = stream.consume()
                    if(nextToken.type !== TokenType.Identifier) throw new ParserError(`parser error, expected identifier, found ${nextToken.value}`, nextToken.position)
                    subReferences.push(new Identifier(nextToken.value))
                    break
                case TokenType.SquareOpen:
                    stream.consume()
                    let exp = this.parseExpression(stream)
                    nextToken = stream.consume()
                    if(nextToken.type !== TokenType.SquareClose) throw new ParserError(`parser error, expected ], found ${nextToken.value}`, nextToken.position)
                    subReferences.push(new IndexAccess(exp))
                    break
                default:
                    continueSearch = false
                    break
            }
            nextToken = stream.peek()
        }
        if(subReferences.length === 0) return ident
        return new PropertyAccess(ident, subReferences)
    }

    private parseFunctionCall(stream : TokenStream) : FunctionCall {
        let currentToken = stream.consume()
        let fnName = currentToken.value
        stream.consume()
        let parameters : Node[] = []
        while(stream.hasNext()) {
            let nextToken = stream.peek()
            if(nextToken.type === TokenType.ParenClose) {
                stream.consume()
                break;
            }
            let param = this.parseExpression(stream)
            parameters.push(param)
            if(!stream.hasNext()) throw new ParserError(`parser error, function call invalid, end of stream found`, nextToken.position)
            // we can just consume it... it does mean that A(1,) is accepted
            nextToken = stream.peek()
            if(nextToken.type === TokenType.Comma) stream.consume()
        }
        return new FunctionCall(fnName, parameters)
    }

    private parseForLoop(stream : TokenStream) : ForLoop {
        stream.consume()
        let nextToken = stream.consume()
        switch(nextToken.type) {
            case TokenType.Each:
                nextToken = stream.peek()
                if(nextToken.type === TokenType.Identifier) {
                    return new ForLoop(ForLoopType.Each, this.parseReference(stream), this.parseOperations(stream))
                } else if (nextToken.type === TokenType.SquareOpen) {
                    return new ForLoop(ForLoopType.Each, this.parseArray(stream), this.parseOperations(stream))
                }
                throw new ParserError(`parser error, for each loop invalid, array or identifier expected after FOR EACH`, nextToken.position)
            case TokenType.ParenOpen:
                let count = this.parseExpression(stream)
                nextToken = stream.consume()
                if(nextToken.type !== TokenType.ParenClose) {
                    throw new ParserError(`parser error, for loop invalid, ) expected after itterations`, nextToken.position)
                }
                return new ForLoop(ForLoopType.For, count, this.parseOperations(stream))
            default:
                throw new ParserError(`parser error, for loop invalid, array or itterations expected`, nextToken.position)
        }
    }

    private parseObject(stream : TokenStream) {
        stream.consume()
        let object = new ObjectNode()
        let finished = false;
        while(stream.hasNext() && !finished) {
            let nameToken = stream.peek()
            if(nameToken.type === TokenType.BraceClose) {
                stream.consume()
                break;
            }
            if(nameToken.type !== TokenType.String) {
                throw new ParserError(`parser error, expected string, found ${nameToken.value}`, nameToken.position)
            }
            stream.consume()
            let nextToken = stream.consume()
            if(nextToken.type !== TokenType.Colon) {
                throw new ParserError(`parser error, expected :, found ${nextToken.value}`, nextToken.position)
            }

            let value = this.parseExpression(stream)
            object.properties.push(new ObjectProperty(nameToken.value, value))
            nextToken = stream.consume()
            switch(nextToken.type) {
                case TokenType.Comma:
                    continue
                case TokenType.BraceClose:
                    finished = true
                    break;
            }
        }
        return object
    }

    //#endregion

    //#region Utility Functions

    private parseArray(stream: TokenStream): any[] {
        let toReturn : any[] = []
        let finished = false;
        let prevValue = null;

        let currentToken = stream.consume()
        if (currentToken.type !== TokenType.SquareOpen) {
            throw new ParserError(`parse error, expected array`, currentToken.position)
        }

        while (stream.hasNext() && !finished) {
            let ref = stream.consume();
            switch (ref.type) {
                case TokenType.String:
                case TokenType.Number:
                    if (prevValue !== null) throw new ParserError(`parse error, missing comma?`, ref.position)
                    prevValue = ref
                    toReturn.push(ref.value)
                    break;
                case TokenType.Comma:
                    prevValue = null;
                    break;
                case TokenType.SquareClose:
                    finished = true;
                    break;
                default:
                    throw new ParserError(`parse error, string or number expected, found ${ref.value}`, ref.position)
            }
        }
        return toReturn;
    }

    //#endregion
}