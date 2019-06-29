import { BinaryOperator } from "./enums/binaryoperator";
import { Node } from "./node";
import { NodeType } from "./nodetype";

export class ConditionGroup extends Node {
    public left: Node
    public right: Node | null = null
    public operator: BinaryOperator | null = null
    public constructor(left: Node) {
        super(NodeType.ConditionGroup)
        this.left = left
    }
}