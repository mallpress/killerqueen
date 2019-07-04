import {Node} from "./node"
import { NodeType } from "./nodetype";
import { Identifier } from "./identifier";

export class PropertyAccess extends Node {
    public object: Identifier
    public property: Identifier | PropertyAccess | Node
    constructor(object: Identifier, property: Identifier | PropertyAccess | Node) {
        super(NodeType.PropertyAccess)
        this.object = object
        this.property = property
    }
}