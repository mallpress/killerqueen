import {Node} from "./node";
import { NodeType } from "./nodetype";

export class FunctionCall extends Node {
    public name: string
    public parameters : Node[]
    constructor(name: string, parameters : Node[]) {
        super(NodeType.FunctionCall)
        this.name = name
        this.parameters = parameters
    }
}