import { Codec, CodecLike, CodecResult, CodecError } from './Codec';
import { RecordFactoryReference, Reference } from './SchemaDocument';
import { Result, Ok, Err } from './Result';

export type RecordFields = { [key: string]: CodecLike };

export type RecordOutput<F extends RecordFields> = {
    [K in keyof F]: F[K] extends Codec<any, infer O> ? O : never;
};

export type RecordA<F extends RecordFields> = {
    [K in keyof F]: F[K] extends Codec<any, any, any, infer A> ? A : never;
};

export type RecordSerialized<F extends RecordFields> = {
    [K in keyof F]: F[K] extends Codec<any, any, infer S> ? S : never;
};

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

function serdes<F extends RecordFields, I, O>(
    fields: F,
    input: I,
    fn: (codec: CodecLike, x: any) => CodecResult<any>,
): Result<O, CodecError> {
    let cow = input as any;
    for (const k of mergeKeys(fields, cow)) {
        const f = fields[k];
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
}

// TODO XXX Not sure how I feel about forcing Exact on Record output; it matches
// how serdes works for now
type ExactInner<T> = <D>() => D extends T ? D : D;
type Exact<T> = ExactInner<T> & T;

export class RecordCodec<
    F extends RecordFields,
    O = Exact<RecordOutput<F>>,
    S = RecordSerialized<F>,
    A = RecordA<F>
> extends Codec<unknown, O, S, A> {
    constructor(
        public readonly alias: string | null,
        public readonly fields: F,
        public readonly parse: (i: unknown) => CodecResult<O>,
        public readonly serialize: (o: A) => CodecResult<S>,
    ) {
        super(alias || 'Record', parse, serialize);
    }

    display() {
        return this.alias ? `Record(${this.alias})` : 'Record';
    }

    hasSchemaDefinition() {
        return this.alias !== null;
    }

    *getReferences(): Iterable<CodecLike> {
        for (const k in this.fields) {
            const c = this.fields[k];
            yield c;
            for (const r of c.getReferences()) {
                yield r;
            }
        }
    }

    schemaReference(): Reference {
        if (this.alias === null) {
            return this.schemaDefinition();
        } else {
            return {
                type: 'CodecReference',
                name: this.name,
            };
        }
    }

    schemaDefinition(each?: (codec: CodecLike) => void): Reference {
        const r: RecordFactoryReference = {
            type: 'RecordFactoryReference',
            fields: {},
        };
        for (const k in this.fields) {
            const f = this.fields[k];
            if (each) {
                each(f);
            }
            r.fields[k] = f.schemaReference();
        }
        return r;
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
