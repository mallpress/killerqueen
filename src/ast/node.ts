import { NodeType } from "./nodetype";

export class Node {
    public nodeType: NodeType
    constructor(nodeType: NodeType) {
        this.nodeType = nodeType
    }
}