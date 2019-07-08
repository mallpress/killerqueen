import {Node} from "./node";
import { NodeType } from "./nodetype";
import { Sequence } from "./sequence";
import { ForLoopType } from "./enums/forlooptype";

export class ForLoop extends Node {
    public type : ForLoopType
    public operations : Sequence
    public parameter : Node | any[]
    constructor(type : ForLoopType, parameter : Node | any[], operations : Sequence) {
        super(NodeType.ForLoop)
        this.type = type
        this.parameter = parameter
        this.operations = operations
    }
}