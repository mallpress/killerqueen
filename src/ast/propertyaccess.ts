import {Node} from "./node"
import { NodeType } from "./nodetype";
import { Identifier } from "./identifier";

export class PropertyAccess extends Node {
    public object: Identifier
    public references: Node[]
    constructor(object: Identifier, references: Node[]) {
        super(NodeType.PropertyAccess)
        this.object = object
        this.references = references
    }
}