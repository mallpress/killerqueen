import {Node} from "./node";
import { NodeType } from "./nodetype";
import { Sequence } from "./sequence";

export class ForLoop extends Node {
    public operations : Sequence
    public parameter : Node | any[]
    constructor(parameter : Node | any[], operations : Sequence) {
        super(NodeType.ForLoop)
        this.parameter = parameter
        this.operations = operations
    }
}