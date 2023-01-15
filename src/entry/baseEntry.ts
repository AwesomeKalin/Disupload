export class BaseEntry {
    name: string;
    mid: string;

    constructor(name: string, mid: string) {
        this.name = name
        this.mid = mid
    }

    get string() {
        return JSON.stringify(this)
    }
}
