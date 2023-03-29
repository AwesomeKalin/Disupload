export class BaseEntry {
    constructor(name, mid) {
        this.name = name;
        this.mid = mid;
    }
    get string() {
        return JSON.stringify(this);
    }
}
