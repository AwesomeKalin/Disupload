export declare class filePart {
    url: string;
    partUUID: string;
    fileUUID: string;
    constructor(url: string, partUUID: string, fileUUID: string);
    getUUID(): string;
    getUrl(): string;
}
