import { filePart } from "./filePart.js";
export declare class file {
    name: string;
    parts: Array<filePart>;
    uuid: string;
    constructor(name: string, uuid: string);
    getName(): string;
    getPartsList(): filePart[];
    getPart(id: number): filePart;
    getUUID(): string;
    addPart(part: filePart): void;
    rename(name: string): void;
}
