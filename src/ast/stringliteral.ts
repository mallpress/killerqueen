import {Node} from "./node"
import { NodeType } from "./nodetype";

export class StringLiteral extends Node {
    public value: string
    constructor(value: string) {
        super(NodeType.StringLiteral)
        this.value = value
    }
}