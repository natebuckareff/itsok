import { flat, collate, group } from './util';

export type Text = Token.Type | Block.Type;

export const Block = (items: Text[], b?: Block.Type): Block.Type => ({
    type: 'block',
    tab: b && b.tab,
    force: b && b.force,
    items,
});

export namespace Block {
    export interface Type {
        type: 'block';
        tab?: boolean;
        force?: boolean;
        items: Text[];
    }
}

export const Token = (token: string): Token.Type => ({
    type: 'token',
    token,
});

export namespace Token {
    export interface Type {
        type: 'token';
        token: string;
    }
}

export const Tab = (items: Text[], force: boolean = false): Block.Type => ({
    type: 'block',
    tab: true,
    force,
    items,
});

function isDelim(text: Text): boolean {
    return text.type === 'token' && (text.token === ', ' || text.token === ';');
}

// Group tokens into single lines lines and lift terminator tokens into adjacent
// blocks
export function condense(text: Text): Text {
    if (text.type === 'token') {
        return text;
    } else {
        // group together delimited items
        const g = group(text.items, x => isDelim(x));

        // collapse each group into single tokens
        const c = g.map(xs => {
            return collate(
                xs,
                (state, x) => {
                    // Only reduce adjacent tokens, and blocks followed by delimiter tokens
                    // prettier-ignore
                    return (
                        (state.type === 'token' && x.type === 'token') ||
                        (state.type === 'block' && isDelim(x))
                    );
                },
                (state, x) => {
                    if (state.type === 'token' && x.type === 'token') {
                        return Token(state.token + x.token);
                    } else {
                        // If a token follows an adjacent block lift the token into the block's items
                        const block = state as Block.Type;
                        return Block([...block.items, x], block);
                    }
                },
            );
        });
        return Block(flat(c).map(condense), text);
    }
}

// Propogate multiline blocks
export function unwrap(text: Text): boolean {
    if (text.type === 'token') {
        return false;
    } else if (text.type === 'block') {
        let tab = false;
        for (const x of text.items) {
            if (unwrap(x)) {
                tab = true;
            }
        }
        if (tab || text.tab) {
            text.tab = true;
            return true;
        }
        return false;
    }
    return false;
}

export function compile(
    text: Text,
    depth: number = -1,
    tab: boolean = false,
): string {
    if (text.type === 'token') {
        if (tab) {
            return '    '.repeat(depth) + text.token + '\n';
        } else {
            return text.token;
        }
    } else {
        let r = '';
        for (const x of text.items) {
            const t = text.type === 'block' && text.tab;
            const d = depth + 1;
            r += compile(x, d, t);
        }

        // If the parent of this block is tabbed, but this block isn't then
        // its items are rendered on a single line and need to be tabbed
        if (tab && !text.tab) {
            r = '    '.repeat(depth + 1) + r + '\n';
        }
        return r;
    }
}
