import {Node} from "./node";
import { NodeType } from "./nodetype";

export class Sequence extends Node {
    public nodes:  Node[] = []
    constructor() {
        super(NodeType.Sequence)
    }
}