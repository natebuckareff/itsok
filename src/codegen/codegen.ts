import * as Schema from '../SchemaDocument';
import { Text, wrap, generateText } from './text';

export function codegenSchema(schema: Schema.SchemaDocument) {
    const ctx: Ctx = {
        schema,
        defs: new Set(schema.definitions.map(x => x.name)),
    };
    const body: Text[] = [`import * as iok from "itsok";`, ``];
    for (const x of schema.definitions) {
        body.push(
            ...wrap(
                `export const ${x.name} = `,
                [...codegenReference(x.reference, ctx)],
                ';',
            ),
        );
        body.push(
            `export namespace ${x.name} {`,
            [
                `export type Type = typeof ${x.name};`,
                `export type I = iok.CodecInput<Type>;`,
                `export type O = iok.CodecOutput<Type>;`,
                `export type P = iok.CodecA<Type>;`,
                `export type S = iok.CodecSerialized<Type>;`,
            ],
            '}',
        );
        body.push(``);
    }
    return generateText(body);
}

interface Ctx {
    schema: Schema.SchemaDocument;
    defs: Set<string>;
}

function* codegenReference(ref: Schema.Reference, ctx: Ctx) {
    switch (ref.type) {
        case 'CodecReference':
            for (const x of codegenCodecReference(ref, ctx)) yield x;
            return;

        case 'GenericFactoryReference':
            for (const x of codegenGenericFactoryReference(ref, ctx)) yield x;
            return;

        case 'RecordFactoryReference':
            for (const x of codegenRecordFactoryReference(ref, ctx)) yield x;
            return;
    }
}

function resolveName(name: string, ctx: Ctx) {
    if (ctx.defs.has(name)) {
        return name;
    } else {
        return `iok.${name}`;
    }
}

function* codegenCodecReference(
    ref: Schema.CodecReference,
    ctx: Ctx,
): Iterable<string> {
    yield `${resolveName(ref.name, ctx)}`;
}

function* codegenGenericFactoryReference(
    ref: Schema.GenericFactoryReference,
    ctx: Ctx,
): Iterable<string> {
    const name = resolveName(ref.name, ctx);
    yield `${name}(${ref.args
        .map(x => {
            if (x.type === 'Literal') {
                const value = JSON.stringify(x.value);
                return x.const ? `${value} as const` : value;
            } else {
                return [...codegenReference(x, ctx)];
            }
        })
        .join(', ')})`;
}

function* codegenRecordFactoryReference(
    ref: Schema.RecordFactoryReference,
    ctx: Ctx,
): Iterable<Text> {
    const name = resolveName('Record', ctx);
    yield `${name}({`;
    const body = [];
    for (const k in ref.fields) {
        body.push(
            ...wrap(`${k}: `, [...codegenReference(ref.fields[k], ctx)], ','),
        );
    }
    yield body;
    yield `})`;
}
