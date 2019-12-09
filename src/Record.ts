import { Codec, CodecLike, CodecResult } from './Codec';
import { CodecReference } from './SchemaDocument';
import { Result, Ok } from './Result';

export type RecordFields = { [key: string]: CodecLike };

export type RecordOutput<S extends RecordFields> = {
    [K in keyof S]: S[K] extends Codec<any, infer O> ? O : never;
};

function serdes<F extends RecordFields, I, O>(
    fields: F,
    input: I,
    fn: (codec: CodecLike, x: any) => CodecResult<any>,
): Result<O, Error> {
    let cow: O = input as any;
    for (const k in cow) {
        const v = cow[k];
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
        public readonly name: string,
        public readonly fields: F,
        public readonly parse: (i: unknown) => CodecResult<O>,
        public readonly serialize: (o: O) => CodecResult<unknown>,
    ) {
        super(name, parse, serialize);
    }

    schema() {
        const ref: CodecReference = {
            type: 'CodecReference',
            name: 'Record',
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
    name: string,
    fields: F,
): RecordCodec<F>;

function Record<F extends RecordFields>(...args: any[]) {
    let name: string;
    let spec: F;

    if (typeof args[0] === 'string') {
        name = `Record(${args[0]})`;
        spec = args[1];
    } else {
        name = `Record`;
        spec = args[0];
    }

    return new RecordCodec<F>(
        name,
        spec,
        i => serdes(spec, i, (c, x) => c.parse(x)),
        o => serdes(spec, o, (c, x) => c.parse(x)),
    );
}

export { Record };
