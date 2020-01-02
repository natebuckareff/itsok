/**
 * Abstract representation of indented text
 *
 * A string is a single line of text. An array of strings are multiple lines of
 * text at the same level of identation
 *
 * ```
 * > ["foo", "bar", "baz"]
 * foo
 * bar
 * baz
 * ```
 *
 * ```
 * > ["foo", ["bar", "baz"], "qux"]
 * foo
 *   bar
 *   baz
 * qux
 * ```
 */

export type Text = string | Text[];

export function generateText(text: Text, depth: number = -1): string {
    if (typeof text === 'string') {
        return '    '.repeat(depth) + text;
    } else {
        const nextDepth = depth + 1;
        return text.map(x => generateText(x, nextDepth)).join('\n');
    }
}

export function prepend(str: string, text: Text): Text {
    if (typeof text === 'string') {
        return str + text;
    } else {
        return [prepend(str, text[0]), ...text.slice(1)];
    }
}

export function append(text: Text, str: string): Text {
    if (typeof text === 'string') {
        return text + str;
    } else {
        return [...text.slice(0, -1), append(text[text.length - 1], str)];
    }
}

export function wrap(a: string, text: Text, b: string): Text {
    if (typeof text === 'string') {
        return a + text + b;
    } else if (text.length === 1) {
        return [wrap(a, text[0], b)];
    } else {
        const x = prepend(a, text[0]);
        const y = append(text[text.length - 1], b);
        return [x, ...text.slice(1, -1), y];
    }
}
