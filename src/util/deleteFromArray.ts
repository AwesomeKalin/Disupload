export function deleteFromArray(array: Array<any>, value: number) { 
    return array.slice(value, value);
}

export function removeItem(listItems: Array<any>) {
    return listItems.splice(-1);
}

export function deleteSpecificObject(list: Array<any>, remove: any) {
    for (var i = 0; i <= list.length; i++) {
        if (list[i] == remove) {
            return deleteFromArray(list, i);
        }
    }
}