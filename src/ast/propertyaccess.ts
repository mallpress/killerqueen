import {Node} from "./node"
import { NodeType } from "./nodetype";
import { Identifier } from "./identifier";

export class PropertyAccess extends Node {
    public object: Identifier
    public property: Identifier
    constructor(object: Identifier, property: Identifier) {
        super(NodeType.PropertyAccess)
        this.object = object
        this.property = property
    }
}