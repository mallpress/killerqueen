import {Node} from "./node";
import { NodeType } from "./nodetype";
import { MathematicalOperator } from "./enums/mathematicaloperator";

export class Aggregate extends Node {
    public left:  Node
    public operator: MathematicalOperator
    public right: Node | null = null
    constructor(left : Node, operator : MathematicalOperator) {
        super(NodeType.Aggregate)
        this.left = left
        this.operator = operator
    }
}