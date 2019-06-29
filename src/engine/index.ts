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

        }
    }
}