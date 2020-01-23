import * as Schema from '../SchemaDocument';
import { Text, Token, Block, Tab, condense, unwrap, compile } from './text';
import { flat, intersperse } from './util';

export namespace codegen {
    interface State {
        subst: Schema.ParamList;
        defs: Map<string, any>;
    }

    export function schema(schema: Schema.SchemaDocument) {
        const state: State = {
            subst: [],
            defs: new Map(),
        };

        const defs: Block.Type[] = [];
        for (const x of schema.definitions) {
            if (x.params && x.params.length > 0) {
                defs.push(...functionDefinition(x, state));
            } else {
                defs.push(...simpleDefinition(x, state));
            }
        }

        const lines = [`import * as iok from 'itsok';\n`];
        lines.push(
            ...defs.map(x => {
                const condensed = condense(x);
                unwrap(condensed);
                return '\n' + compile(condensed);
            }),
        );
        return lines.join('');
    }

    function definitionNamepsace(name: string) {
        return Tab([
            Token(`export namespace ${name} {`),
            Tab([
                Token(`export type Type = typeof ${name}`),
                Token(`;`),
                Token(`export type I = Type['I']`),
                Token(`;`),
                Token(`export type O = Type['O']`),
                Token(`;`),
                Token(`export type P = Type['P']`),
                Token(`;`),
                Token(`export type S = Type['S'];`),
            ]),
            Token(`}`),
        ]);
    }

    function* simpleDefinition(
        def: Schema.Definition,
        state: State,
    ): Iterable<Block.Type> {
        const ref = [...reference(def.reference, state)];
        const xs = ref.slice(0, -1);
        const x = ref[ref.length - 1] as Token.Type;

        yield Tab([
            Token(`export const ${def.name} = `),
            ...[...xs, Token(x.token + ';')],
        ]);
        yield definitionNamepsace(def.name);
    }

    function* functionDefinition(
        def: Schema.Definition,
        state: State,
    ): Iterable<Block.Type> {
        const params = def.params!;

        const nextState = { ...state };
        nextState.subst = params;

        const typeArgs = params
            .map((_, i) => `C${i} extends iok.Codec.Like`)
            .join(', ');

        const funcArgs = params
            .map((x, i) => {
                if (x === 'Literal') {
                    return `arg${i}: any`;
                } else {
                    return `arg${i}: C${i}`;
                }
            })
            .join(', ');

        const aliasArgs = params.map((_, i) => `arg${i}`).join(', ');

        const aliasArgsText: Text[][] = [
            [Token(`"${def.name}"`)],
            [Token(`[${aliasArgs}]`)],
            [...reference(def.reference, nextState)],
        ];

        yield Block([
            Token(`export const ${def.name} = <${typeArgs}>(${funcArgs}) => {`),
            Tab([
                Token('return Alias('),
                Block(flat(intersperse(aliasArgsText, [Token(', ')]))),
                Token(')'),
            ]),
            Token('}'),
        ]);

        yield definitionNamepsace(def.name);
    }

    function resolve(name: string, state: State): string {
        if (state.defs.has(name)) {
            return name;
        } else {
            return `iok.${name}`;
        }
    }

    function* reference(ref: Schema.Reference, state: State): Iterable<Text> {
        yield Token(resolve(ref.name, state));
        if (ref.args) {
            yield Token('(');
            yield Block([...argumentList(ref.args, state)]);
            yield Token(')');
        }
    }

    function* argumentList(args: Schema.ArgList, state: State): Iterable<Text> {
        if (Array.isArray(args)) {
            const argsText: Text[][] = [];
            for (const x of args) {
                argsText.push([...argument(x, state)]);
            }
            for (const t of flat(intersperse(argsText, [Token(', ')]))) {
                yield t;
            }
        } else {
            const argsText: Text[][] = [];
            for (const k in args) {
                argsText.push([Token(`"${k}": `), ...argument(args[k], state)]);
            }
            for (const t of flat(intersperse(argsText, [Token(', ')]))) {
                yield t;
            }
        }
    }

    function* argument(arg: Schema.Arg, state: State): Iterable<Text> {
        if (arg.type === 'Literal') {
            yield Token('LITERAL');
        } else if (arg.type === 'Param') {
            yield Token(`arg${arg.param}`);
        } else {
            for (const t of reference(arg, state)) {
                yield t;
            }
        }
    }
}
