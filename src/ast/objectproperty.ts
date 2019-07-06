import {Node} from "./node";
import { NodeType } from "./nodetype";

export class ObjectProperty extends Node {
    public name:  string
    public value: Node
    constructor(name : string, value: Node) {
        super(NodeType.Object)
        this.name = name
        this.value = value
    }
}