export function deleteFromArray(array, value) {
    return array.slice(value, value);
}
export function removeItem(listItems) {
    return listItems.splice(-1);
}
export function deleteSpecificObject(list, remove) {
    for (var i = 0; i <= list.length; i++) {
        if (list[i] == remove) {
            return deleteFromArray(list, i);
        }
    }
}
