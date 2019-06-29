import {Node} from "./node"
import { NodeType } from "./nodetype";

export class BooleanLiteral extends Node {
    public value: boolean
    constructor(value: boolean) {
        super(NodeType.BooleanLiteral)
        this.value = value
    }
}