import { Ok, Err } from './Result';

import { Codec, CodecResult, CodecError, Reference, ArgList } from './Codec';

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

export type RecordFields = { [key: string]: Codec.Like };

export type RecordOutput<F extends RecordFields> = {
    [K in keyof F]: Codec.OutputT<F[K]>;
};

export type RecordParsed<F extends RecordFields> = {
    [K in keyof F]: Codec.ParsedT<F[K]>;
};

export type RecordSerialized<F extends RecordFields> = {
    [K in keyof F]: Codec.SerializedT<F[K]>;
};

export class RecordCodec<F extends RecordFields> extends Codec<
    unknown,
    RecordOutput<F>,
    RecordParsed<F>,
    RecordSerialized<F>,
    F,
    never
> {
    constructor(fields: F) {
        super('Record', fields);
    }

    private serdes = <I, O>(
        input: I,
        fn: (codec: Codec.Like, x: any) => CodecResult<any>,
    ): CodecResult<O> => {
        let cow = input as any;
        const isUndefined = Object.is(cow, undefined);
        if (isUndefined || Object.is(cow, null)) {
            const got = isUndefined ? 'undefined' : 'null';
            return Err(
                new CodecError(`Expected an object but got ${got} instead`),
            );
        }
        for (const k of mergeKeys(this.args, cow)) {
            const f = this.args[k];
            if (f === undefined) {
                return Err(new CodecError(`Unknown field "${k}"`));
            }

            const v = cow[k];
            const r = fn(f, v);
            if (r.isError) {
                return r;
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

    parse(input: unknown): CodecResult<RecordOutput<F>> {
        return this.serdes(input, (c, x) => c.parse(x));
    }

    serialize(parsed: RecordParsed<F>): CodecResult<RecordSerialized<F>> {
        return this.serdes(parsed, (c, x) => c.serialize(x));
    }

    getReference(subst?: Map<Codec.Like, number>): Reference {
        const args: ArgList = {};
        const ref: Reference = {
            type: 'Reference',
            name: this.name,
            args,
        };
        for (const k in this.args) {
            const field = this.args[k];
            if (subst && subst.has(field)) {
                args[k] = { type: 'Param', param: subst.get(field)! };
            } else {
                args[k] = field.getReference(subst);
            }
        }
        return ref;
    }
}

export function Record<F extends RecordFields>(fields: F) {
    return new RecordCodec(fields);
}
