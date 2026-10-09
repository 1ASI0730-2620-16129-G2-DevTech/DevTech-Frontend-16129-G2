import {ref} from "vue";
import {mergeSort} from "../domain/model/merge-sort.js";

/**
 * Text typed in the header search bar. Shared by the layout (which writes it)
 * and every board (which filters its rows with it).
 */
const query = ref("");

export function useBoardSearch() {
    return {query};
}

/** Lowercase, without accents, spaces at the ends or the "#" used in codes (#PG001). */
function normalize(text) {
    return String(text ?? "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/#/g, "").trim();
}

const EXACT = 0, STARTS_WITH = 1, CONTAINS = 2, NO_MATCH = 3;

/** How well one row matches: the best score among its searchable fields. */
function relevance(fields, text) {
    let best = NO_MATCH;
    for (const field of fields) {
        const value = normalize(field);
        if (value === text) return EXACT;
        if (value.startsWith(text)) best = Math.min(best, STARTS_WITH);
        else if (value.includes(text)) best = Math.min(best, CONTAINS);
    }
    return best;
}

/**
 * Keeps the rows that match the search text and orders them with Merge Sort by
 * relevance (exact match, then starts with, then contains). Merge Sort is stable,
 * so rows with the same relevance keep the order the board already had.
 * @template T
 * @param {T[]} items - Rows in the board's own order.
 * @param {(item: T) => any[]} fields - Values of the row the user can search by.
 * @param {string} text - Search text; empty returns the rows untouched.
 * @returns {T[]}
 */
export function searchItems(items, fields, text) {
    const normalized = normalize(text);
    if (!normalized) return items;
    const matches = items
        .map((item) => ({item, score: relevance(fields(item), normalized)}))
        .filter((match) => match.score !== NO_MATCH);
    return mergeSort(matches, (a, b) => a.score - b.score).map((match) => match.item);
}
