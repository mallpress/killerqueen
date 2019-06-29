import {Node} from "./node"
import { NodeType } from "./nodetype";
import { Identifier } from "./identifier";
import { PropertyAccess } from "./propertyaccess";
import { AssignmentOperator } from "./enums/assignmentoperator";

export class Operation extends Node {
    public reference: Identifier | PropertyAccess
    public operator: AssignmentOperator
    public expression: Node
    constructor(reference: Identifier | PropertyAccess, operator: AssignmentOperator, expression : Node) {
        super(NodeType.Operation)
        this.reference = reference
        this.operator = operator
        this.expression = expression
    }
}