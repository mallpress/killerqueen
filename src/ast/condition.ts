import {Node} from "./node";
import { BooleanOperator } from "./booleanoperator";
import { NodeType } from "./nodetype";
import { Identifier } from "./identifier";
import { PropertyAccess } from "./propertyaccess";

export class Condition extends Node {
    public left: Node
    public operator: BooleanOperator
    public right: Node
    constructor(left: Node, operator: BooleanOperator, right: Node) {
        super(NodeType.Condition)
        this.left = left
        this.operator = operator
        this.right = right
    }
}