import { ArgList, Reference } from './SchemaDocument';
import { Codec, CodecResult } from './Codec';
import { CodecError } from './CodecError';
import { Ok, Err } from './Result';

function* mergeKeys(a: any, b: any): Iterable<string> {
    for (const k in a) {
        yield k;
    }
    for (const k in b) {
        if (!a[k]) {
            yield k;
        }
    }
}

export type RecordFields = { [key: string]: Codec.Any };

export type RecordOutput<F extends RecordFields> = {
    [K in keyof F]: Codec.Output<F[K]>;
};

export type RecordParsed<F extends RecordFields> = {
    [K in keyof F]: Codec.Parsed<F[K]>;
};

export type RecordSerialized<F extends RecordFields> = {
    [K in keyof F]: Codec.Serialized<F[K]>;
};

export class RecordCodec<F extends RecordFields> extends Codec<
    unknown,
    RecordOutput<F>,
    RecordParsed<F>,
    RecordSerialized<F>,
    F
> {
    constructor(fields: F) {
        super(
            'Record',
            fields,
            input => this.serdes(input, (c, x) => c.parse(x)),
            parsed => this.serdes(parsed, (c, x) => c.serialize(x)),
        );
    }

    private serdes = <I, O>(
        input: I,
        fn: (codec: Codec.Any, x: any) => CodecResult<any>,
    ): CodecResult<O> => {
        let cow = input as any;
        const isUndefined = Object.is(cow, undefined);
        if (isUndefined || Object.is(cow, null)) {
            const got = isUndefined ? 'undefined' : 'null';
            return Err(
                new CodecError(
                    this,
                    `Expected an object but got ${got} instead`,
                ),
            );
        }
        for (const k of mergeKeys(this.args, cow)) {
            const f = this.args[k];
            if (f === undefined) {
                return Err(new CodecError(this, `Unknown field "${k}"`));
            }

            const v = cow[k];
            const r = fn(f, v);
            if (r.isError) {
                return Err(
                    new CodecError(this, `Invalid field "${k}"`, r.error),
                );
            }
            if (r.success !== v) {
                if ((input as any) === cow) {
                    cow = { ...(input as any) };
                }
                cow[k] = r.success;
            }
        }
        return Ok(cow);
    };

    visitArgs(visitor: (x: any, k?: number | string) => void) {
        for (const k in this.args) {
            visitor(this.args[k], k);
        }
    }

    getReference(subst?: Map<Codec.Any, number>): Reference {
        const args: ArgList = {};
        const ref: Reference = {
            type: 'Reference',
            name: this.name,
            args,
        };
        this.visitArgs((arg, k) => {
            if (subst && subst.has(arg)) {
                args[k + ''] = { type: 'Param', param: subst.get(arg)! };
            } else if (arg instanceof Codec) {
                args[k + ''] = arg.getReference(subst);
            } else {
                const typename = typeof arg;
                args[k + ''] = {
                    type: 'Literal',
                    kind: typename,
                    value: arg,
                };
            }
        });
        return ref;
    }
}

export function Record<F extends RecordFields>(fields: F) {
    return new RecordCodec(fields);
}
