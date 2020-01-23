export function intersperse<T>(array: T[], delim: T): T[] {
    const nextArray = [];
    for (let i = 0; i < array.length; ++i) {
        nextArray.push(array[i]);
        if (i < array.length - 1) {
            nextArray.push(delim);
        }
    }
    return nextArray;
}

export function flat<T>(array: T[][]): T[] {
    return array.reduce((x, y) => x.concat(y), []);
}

export function group<T>(array: T[], term: (x: T) => boolean): T[][] {
    const grouped: T[][] = [];
    let current: T[] = [];
    for (const x of array) {
        if (term(x)) {
            current.push(x);
            grouped.push(current);
            current = [];
        } else {
            current.push(x);
        }
    }
    if (group.length > 0) {
        grouped.push(current);
    }
    return grouped;
}

export function collect<T>(
    array: T[],
    test: (prev: T[], next: T) => boolean,
): T[][] {
    const collected: T[][] = [];
    let prev: T[] = [];
    for (const x of array) {
        if (test(prev, x)) {
            prev.push(x);
        } else {
            if (prev.length > 0) {
                collected.push(prev);
                prev = [];
            }
            collected.push([x]);
        }
    }
    if (prev.length > 0) {
        collected.push(prev);
    }
    return collected;
}

export function collate<T>(
    xs: T[],
    test: (state: T, x: T) => boolean,
    reduce: (state: T, y: T) => T,
): T[] {
    const collated = [xs[0]];
    for (let i = 1; i < xs.length; ++i) {
        const x = xs[i];
        let state = collated[collated.length - 1];
        if (test(state, x)) {
            collated[collated.length - 1] = reduce(state, x);
        } else {
            collated.push(x);
        }
    }
    return collated;
}
