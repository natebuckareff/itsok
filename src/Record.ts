import { Codec, CodecLike, CodecResult } from './Codec';
import { RecordFactoryReference } from './SchemaDocument';
import { Result, Ok, Err } from './Result';

export type RecordFields = { [key: string]: CodecLike };

export type RecordOutput<F extends RecordFields> = {
    [K in keyof F]: F[K] extends Codec<any, infer O> ? O : never;
};

function serdes<F extends RecordFields, I, O>(
    fields: F,
    input: I,
    fn: (codec: CodecLike, x: any) => CodecResult<any>,
): Result<O, Error> {
    let cow = input as any;
    for (const k in fields) {
        const v = cow[k];
        if (v === undefined) {
            return Err(new Error(`Missing field "${k}"`));
        }

        const r = fn(fields[k], v);
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
}

export class RecordCodec<
    F extends RecordFields,
    O = RecordOutput<F>
> extends Codec<unknown, O> {
    constructor(
        public readonly alias: string | null,
        public readonly fields: F,
        public readonly parse: (i: unknown) => CodecResult<O>,
        public readonly serialize: (o: O) => CodecResult<unknown>,
    ) {
        super(alias || 'Record', parse, serialize);
    }

    display() {
        return this.alias ? `Record(${this.alias})` : 'Record';
    }

    schema() {
        const ref: RecordFactoryReference = {
            type: 'RecordFactoryReference',
            fields: {},
        };
        for (const k in this.fields) {
            ref.fields[k] = this.fields[k].schema();
        }
        return ref;
    }
}

function Record<F extends RecordFields>(fields: F): RecordCodec<F>;

function Record<F extends RecordFields>(
    alias: string,
    fields: F,
): RecordCodec<F>;

function Record<F extends RecordFields>(...args: any[]) {
    let alias: string | null;
    let spec: F;

    if (typeof args[0] === 'string') {
        alias = args[0];
        spec = args[1];
    } else {
        alias = null;
        spec = args[0];
    }

    return new RecordCodec<F>(
        alias,
        spec,
        i => serdes(spec, i, (c, x) => c.parse(x)),
        o => serdes(spec, o, (c, x) => c.serialize(x)),
    );
}

export { Record };
