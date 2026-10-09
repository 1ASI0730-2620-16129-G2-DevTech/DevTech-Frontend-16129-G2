/**
 * Sorts a copy of the array with Merge Sort: split it in halves, sort each half
 * recursively and merge them. O(n log n) in every case.
 * It is stable: elements the comparator considers equal keep their original order.
 * @template T
 * @param {T[]} items - Not modified.
 * @param {(a: T, b: T) => number} compare - Negative if a goes first, positive if b goes first, 0 if equal.
 * @returns {T[]}
 */
export function mergeSort(items, compare) {
    if (items.length <= 1) {
        return [...items];
    }
    const middle = Math.floor(items.length / 2);
    const left = mergeSort(items.slice(0, middle), compare);
    const right = mergeSort(items.slice(middle), compare);
    return merge(left, right, compare);
}

/**
 * Merges two sorted arrays into one sorted array.
 * On a tie it takes from the left half first, which keeps the sort stable.
 */
function merge(left, right, compare) {
    const merged = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
        if (compare(left[i], right[j]) <= 0) {
            merged.push(left[i++]);
        } else {
            merged.push(right[j++]);
        }
    }
    while (i < left.length) merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);
    return merged;
}
