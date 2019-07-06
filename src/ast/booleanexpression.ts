import {Node} from "./node";
import { BooleanOperator } from "./booleanoperator";
import { NodeType } from "./nodetype";
import { Identifier } from "./identifier";
import { PropertyAccess } from "./propertyaccess";

export class BooleanExpression extends Node {
    public left: Node
    public operator: BooleanOperator
    public right: Node
    constructor(left: Node, operator: BooleanOperator, right: Node) {
        super(NodeType.BooleanExpression)
        this.left = left
        this.operator = operator
        this.right = right
    }
}