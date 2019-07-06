import {Node} from "./node";
import { NodeType } from "./nodetype";
import { ObjectProperty } from "./objectproperty";

export class ObjectNode extends Node {
    public properties:  ObjectProperty[] = []
    constructor() {
        super(NodeType.Object)
    }
}