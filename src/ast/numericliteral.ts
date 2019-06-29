import {Node} from "./node"
import { NodeType } from "./nodetype";

export class NumericLiteral extends Node {
    public value: number
    constructor(value: number) {
        super(NodeType.NumericLiteral)
        this.value = value
    }
}