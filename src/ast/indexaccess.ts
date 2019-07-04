import {Node} from "./node"
import { NodeType } from "./nodetype";

export class IndexAccess extends Node {
    public index: Node
    constructor(index: Node) {
        super(NodeType.IndexAccess)
        this.index = index
    }
}