import { Token } from "../token";
import { TokenType } from "../tokentype";
import { BooleanOperator } from "../ast/booleanoperator";
import { Condition } from "../ast/condition";
import { Sequence } from "../ast/sequence";
import { Operation } from "../ast/operation";
import { ParserError } from "./parsererror";
import { Branch } from "../ast/branch";
import { TokenStream } from "../tokenstream";
import { Node } from "../ast/node";
import { BinaryOperator } from "../ast/enums/binaryoperator";
import { ConditionGroup } from "../ast/conditiongroup";
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
        let conds = this.parseConditionals(stream)
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

    private parseConditionals(stream: TokenStream, parenOpen: number = 0): Node {
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
                    let newGroup = new ConditionGroup(prevNode)
                    newGroup.operator = operator
                    let nextToken = stream.peek()
                    if (!nextToken) throw new ParserError(`${currentToken.value} found, with nothing after it`, currentToken.position)

                    if (nextToken.type === TokenType.ParenOpen) {
                        newGroup.right = this.parseConditionals(stream, parenOpen);
                    } else {
                        let newCond = this.parseConditional(stream)
                        // need to handle the case of A || B && C, so we steal B
                        // from the previous group and create a new group with B as left and set
                        // the previous group's right to the new group this gives up A || (B && C)
                        // this should only be done if the previous expression was not
                        // in brackets, as that should be treated as fixeds
                        if (currentToken.type === TokenType.And && !prevInGroup) {
                            if (prevNode.nodeType == NodeType.ConditionGroup) {
                                let prevGroup = prevNode as ConditionGroup;
                                let newLeft = prevGroup.right as Node;
                                newGroup = new ConditionGroup(newLeft)
                                newGroup.operator = operator
                                newGroup.right = newCond
                                prevGroup.right = newGroup
                                newGroup = prevGroup
                            } else {
                                // if it was just a condition we can continue on as planned
                                newGroup.right = newCond
                            }
                        } else {
                            // if it was an or, then we can continue on as planned
                            newGroup.right = newCond
                        }
                    }
                    prevNode = newGroup as Node
                    break;
                case TokenType.ParenOpen:
                    parenOpen++;
                    stream.consume()
                    prevNode = this.parseConditionals(stream, parenOpen);
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
                    prevNode = this.parseConditional(stream)
                    prevInGroup = false
                    break;
            }
        }
        return prevNode!
    }

    private parseConditional(stream: TokenStream): Node {
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
                left = new BooleanLiteral(true)
                break;
            case TokenType.False:
                stream.consume()
                left = new BooleanLiteral(false)
                break;
            case TokenType.Identifier:
                left = this.parseReference(stream)
                break
            default:
                throw new ParserError(`parse error, conditional type expected, found ${currentToken.value}`, currentToken.position)
        }

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
            default:
                return left
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

        return new Condition(left, operator, right);
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

    private parseOperation(stream: TokenStream): Operation {
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
            switch(currentToken.type) {
                case TokenType.String:
                    stream.consume()
                    toReturn = new StringLiteral(currentToken.value)
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
        if(toReturn === null) throw new ParserError(`parser error, expression, found ${currentToken!.value}`, currentToken!.position)
        if(currentExpression !== null) {
            currentExpression.right = toReturn
            return currentExpression
        }
        return toReturn
    }

    private parseReference(stream : TokenStream) : Identifier | PropertyAccess {
        let nextToken = stream.consume()
        let ident : Identifier | PropertyAccess = new Identifier(nextToken.value);

        if(!stream.hasNext()) return ident

        nextToken = stream.peek()

        if(nextToken.type === TokenType.Dot) {
            stream.consume()
            if(!stream.hasNext()) throw new ParserError(`parser error, property name expected, end of stream found`, nextToken.position)
            nextToken = stream.consume();           
            if(nextToken.type !== TokenType.Identifier) throw new ParserError(`parse error, property name expected, found ${nextToken.value}`, nextToken.position)
            let propAccess = this.parseReference(stream)
            ident = new PropertyAccess(ident, propAccess)
        } else if(nextToken.type === TokenType.SquareOpen) {
            stream.consume()
            if(!stream.hasNext()) throw new ParserError(`parser error, object or array index expected, end of stream found`, nextToken.position)

            let index = this.parseExpression(stream);
            if(!stream.hasNext()) throw new ParserError(`parser error, end of array access expected ], end of stream found`, nextToken.position)

            nextToken = stream.consume()
            if(nextToken.type !== TokenType.SquareClose) throw new ParserError(`parser error, end of array access expected ], found ${nextToken.value}`, nextToken.position)

            nextToken = stream.peek()
            if(nextToken.type === TokenType.Dot) {
                
            } 
            else {
                return new PropertyAccess(ident, index)
            }
        }
        return ident
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
                if(nextToken.type !== TokenType.SquareOpen) {
                    throw new ParserError(`parser error, for loop invalid, [ expected after FOR EACH`, nextToken.position)
                }
                return new ForLoop(this.parseArray(stream), this.parseOperations(stream))
            case TokenType.ParenOpen:
                let count = this.parseExpression(stream)
                nextToken = stream.consume()
                if(nextToken.type !== TokenType.ParenClose) {
                    throw new ParserError(`parser error, for loop invalid, ) expected after itterations`, nextToken.position)
                }
                return new ForLoop(count, this.parseOperations(stream))
            default:
                throw new ParserError(`parser error, for loop invalid, array or itterations expected`, nextToken.position)
        }
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
                    throw new ParserError(`parse error, string expected, found ${ref.value}`, ref.position)
            }
        }
        if (toReturn.length === 0) throw new ParserError(`parse error, empty array found`, currentToken.position)

        return toReturn;
    }

    //#endregion
}