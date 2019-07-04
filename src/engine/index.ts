import { Sequence } from "../ast/sequence";
import { Operation } from "../ast/operation";
import { NodeType } from "../ast/nodetype";
import { Branch } from "../ast/branch";
import { Node } from "../ast/node";
import { AssignmentOperator } from "../ast/enums/assignmentoperator";
import { PropertyAccess } from "../ast/propertyaccess";
import { Identifier } from "../ast/identifier";
import { NumericLiteral } from "../ast/numericliteral";
import { StringLiteral } from "../ast/stringliteral";
import { BooleanLiteral } from "../ast/booleanliteral";
import { FunctionCall } from "../ast/functioncall";
import { ConditionGroup } from "../ast/conditiongroup";
import { Condition } from "../ast/condition";
import { BinaryOperator } from "../ast/enums/binaryoperator";
import { BooleanOperator } from "../ast/booleanoperator";
import { Aggregate } from "../ast/aggregate";
import { MathematicalOperator } from "../ast/enums/mathematicaloperator";
import { ForLoop } from "../ast/forloop";
import { IndexAccess } from "../ast/indexaccess";

declare var log : (s : string) => void

export class Engine {
    private ast : Sequence
    public constructor(ast : Sequence) {
        this.ast = ast
    }

    public execute(context : {[ key : string] : any}) {
        for(let i = 0; i < this.ast.nodes.length; i++) {
            let line = this.ast.nodes[i]
            switch(line.nodeType) {
                case NodeType.Operation:
                    this.executeOperation(line as Operation, context)
                    break;
                case NodeType.Branch:
                    this.evaluateBranch(line as Branch, context)
                    break;
                case NodeType.ForLoop:
                    this.executeForLoop(line as ForLoop, context)
                    break;
            }
        }
    }

    public executeSequence(sequence : Sequence, context : {[ key : string] : any}) {
        for(let i = 0; i < sequence.nodes.length; i++) {
            let node = sequence.nodes[i]
            switch(node.nodeType) {
                case NodeType.Branch:
                    this.evaluateBranch(node as Branch, context)
                    break;
                case NodeType.Operation:
                    this.executeOperation(node as Operation, context)
                    break;
            }
        }
    }
    
    private executeOperation(operation: Operation, context: {[ key : string] : any}) {
        let rightValue = this.evaluateExpression(operation.expression, context)

        if(operation.reference.nodeType === NodeType.PropertyAccess) {
            let propAccess = operation.reference as PropertyAccess
            ///@ts-ignore
            let obj = context[propAccess.object.name]
            let currentValue = undefined
            switch(operation.operator) {
                case AssignmentOperator.Equals:
                    ///@ts-ignore
                    obj[propAccess.property.name] = rightValue
                    break;
                case AssignmentOperator.PlusEquals:
                    ///@ts-ignore
                    currentValue = obj[propAccess.property.name]
                    ///@ts-ignore
                    obj[propAccess.property.name] = currentValue + rightValue
                    break;
                case AssignmentOperator.MinusEquals:
                    ///@ts-ignore
                    currentValue = obj[propAccess.property.name]
                    ///@ts-ignore
                    obj[propAccess.property.name] = currentValue - (rightValue as any)
                    break;
            }
            return
        }
        let ref = operation.reference as Identifier
        let leftValue = context[ref.name]
        switch(operation.operator) {
            case AssignmentOperator.Equals:
                leftValue = rightValue
                break;
            case AssignmentOperator.PlusEquals:
                leftValue = leftValue + rightValue
                break;
            case AssignmentOperator.MinusEquals:
                leftValue = leftValue - (rightValue as any)
                break;
        }
        context[ref.name] = leftValue
    }

    private evaluateBranch(branch: Branch, context: {[ key : string] : any}) {
        if(this.evaluateConditions(branch.condition, context)) {
            this.executeSequence(branch.condTrueBody, context)
        }
        else if(branch.condFalseBody) {
            this.executeSequence(branch.condFalseBody, context)
        }
    }

    private evaluateConditions(conditions : Node, context : {[key : string]  : any}) : boolean {
        switch(conditions.nodeType) {
            case NodeType.BooleanLiteral:
                return (conditions as BooleanLiteral).value
            case NodeType.Condition: 
                return this.evaluateCondition(conditions as Condition, context)
            case NodeType.ConditionGroup:
                let condGroup = conditions as ConditionGroup
                let leftResult = this.evaluateConditions(condGroup.left, context)
                let rightResult = true
                if (condGroup.right) {
                    rightResult = this.evaluateConditions(condGroup.right, context)
                    switch (condGroup.operator) {
                    case BinaryOperator.And:
                        return leftResult && rightResult
                    case BinaryOperator.Or:
                        return leftResult || rightResult
                    case BinaryOperator.Not:
                        return leftResult && !rightResult
                    }
                }
        }
        return false
    }

    private evaluateCondition(condition : Node, context : {[key : string]  : any}) : boolean {
        switch(condition.nodeType) {
            case NodeType.Condition:
                let cond = condition as Condition
                let left = this.evaluateExpression(cond.left, context)
                let right = this.evaluateExpression(cond.right, context)
                switch(cond.operator) {
                    case BooleanOperator.DoubleEquals:
                        return left == right
                    case BooleanOperator.GreaterThan:
                        return left > right
                    case BooleanOperator.GreaterThanEqual:
                            return left >= right
                    case BooleanOperator.LessThan:
                            return left < right
                    case BooleanOperator.LessThanEqual:
                            return left <= right
                    case BooleanOperator.NotEquals:
                            return left != right
                }
        }
        return false
    }
    
    private evaluateExpression(expression: Node, context: {[ key : string] : any}) : any {
        switch(expression.nodeType) {
            case NodeType.NumericLiteral:
                return (expression as NumericLiteral).value
            case NodeType.StringLiteral:
                return (expression as StringLiteral).value
            case NodeType.BooleanLiteral:
                return (expression as BooleanLiteral).value
            case NodeType.FunctionCall:
                return this.executeFunction(expression as FunctionCall, context)
            case NodeType.Identifier: 
                let ident = (expression as Identifier).name
                return context[ident]
            case NodeType.PropertyAccess:
                return this.resolvePropertyAccess(expression as PropertyAccess, context)
            case NodeType.Aggregate:
                return this.computeAggregate(expression as Aggregate, context)
        }
    }

    private resolvePropertyAccess(reference: PropertyAccess, context : {[ key : string] : any}) : any {
        let currentContext = context[reference.object.name]
        for(let i = 0; i < reference.references.length; i++) {
            let ref = reference.references[i]
            if(ref.nodeType === NodeType.Identifier) {
                currentContext = currentContext[(ref as Identifier).name]
            } else {
                currentContext = currentContext[this.evaluateExpression((ref as IndexAccess).index, context)]
            }
        }
        return currentContext
    }

    private computeAggregate(aggregate: Aggregate, context: {[ key : string] : any}) {
        let left = this.evaluateExpression(aggregate.left, context)
        let right = this.evaluateExpression(aggregate.right!, context)
        switch(aggregate.operator) {
            case MathematicalOperator.Plus:
                return left + right
            case MathematicalOperator.Minus:
                return left - right
            case MathematicalOperator.Multiply:
                return left * right
            case MathematicalOperator.Divide:
                return left / right
        }
    }

    private executeForLoop(loop : ForLoop, context: {[ key : string] : any}) {
        if(Array.isArray(loop.parameter)) {
            let vals = loop.parameter
            for(let i = 0; i < vals.length; i++) {
                context['$val'] = vals[i]
                this.executeSequence(loop.operations, context)
            }
            delete context['$val']
        }
        else {
            let val = this.evaluateExpression(loop.parameter, context)
            for(let i = 0; i < val; i++) {
                context['$val'] = i
                this.executeSequence(loop.operations, context)
            }
            delete context['$val']
        }
    }

    private executeFunction(call : FunctionCall, context: {[ key : string] : any}) : any {
        let fnName = call.name.toUpperCase()
        switch(fnName) {
            case 'MAX':
                return this.evaluateMax(call.parameters, context)
            case 'MIN':
                return this.evaluateMin(call.parameters, context)
            case 'ABS':
                return Math.abs(this.evaluateExpression(call.parameters[0], context))
            case 'CEIL':
                return Math.ceil(this.evaluateExpression(call.parameters[0], context))
            case 'FLOOR':
                return Math.floor(this.evaluateExpression(call.parameters[0], context))
            case 'LOG':
                log(this.evaluateExpression(call.parameters[0], context))
                break;
            case 'GETNODE':
                let nodeModel = context['model']
                return nodeModel.getNode(this.evaluateExpression(call.parameters[0], context))
            case 'GETLINK':
                let linkModel = context['model']
                return linkModel.getLink(this.evaluateExpression(call.parameters[0], context))
        }
    }

    private evaluateMax(args : Node [], context: {[ key : string] : any}) : number {
        let res = undefined
        for(let i = 0; i < args.length; i++) {
            let exp = args[i]
            let val = this.evaluateExpression(exp, context)
            if(res === undefined || val > res) res = val
        }
        return res
    }
    
    private evaluateMin(args : Node [], context: {[ key : string] : any}) : number {
        let res = undefined
        for(let i = 0; i < args.length; i++) {
            let exp = args[i]
            let val = undefined
            switch(exp.nodeType) {
                case NodeType.NumericLiteral:
                case NodeType.FunctionCall:
                    val = this.evaluateExpression(exp, context)
                    break;
                case NodeType.PropertyAccess:
                    let prop = (exp as PropertyAccess)
                    val = this.evaluateExpression(prop, context)
                    break;
            }
            if(res === undefined || val < res) res = val
        }
        return res
    }
}