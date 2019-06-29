import {Node} from "./node"
import { NodeType } from "./nodetype";

export class Identifier extends Node {
    public name: string
    constructor(name: string) {
        super(NodeType.Identifier)
        this.name = name
    }
}