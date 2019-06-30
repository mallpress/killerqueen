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
            }
        }
    }
    
    private executeOperation(operation: Operation, context: {[ key : string] : any}) {
        let rightValue = this.evaluateExpression(operation.expression, context)

        if(operation.reference.nodeType === NodeType.PropertyAccess) {
            let propAccess = operation.reference as PropertyAccess
            let obj = context[propAccess.object.name]
            let currentValue = undefined
            switch(operation.operator) {
                case AssignmentOperator.Equals:
                    obj[propAccess.property.name] = rightValue
                    break;
                case AssignmentOperator.PlusEquals:
                    currentValue = obj[propAccess.property.name]
                    obj[propAccess.property.name] = currentValue + rightValue
                    break;
                case AssignmentOperator.MinusEquals:
                    currentValue = obj[propAccess.property.name]
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
        ;
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
                let prop = (expression as PropertyAccess)
                return context[prop.object.name][prop.property.name]
                return this
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
            let val = undefined
            switch(exp.nodeType) {
                case NodeType.NumericLiteral:
                case NodeType.FunctionCall:
                    val = this.evaluateExpression(exp, context)
                    break;
                case NodeType.PropertyAccess:
                    let prop = (exp as PropertyAccess)
                    val = context[prop.object.name][prop.property.name]
                    break;
            }
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
                    val = context[prop.object.name][prop.property.name]
                    break;
            }
            if(res === undefined || val < res) res = val
        }
        return res
    }
}