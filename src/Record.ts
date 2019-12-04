import { Codec, CodecLike, CodecResult } from './Codec';
import { Result, Ok } from './Result';

export type RecordSpec = { [key: string]: CodecLike };

export type RecordOutput<S extends RecordSpec> = {
    [K in keyof S]: S[K] extends Codec<infer I, any> ? I : never;
};

export type RecordCodec<S extends RecordSpec> = Codec<unknown, RecordOutput<S>>;

function serdes<S extends RecordSpec, I, O>(
    spec: S,
    input: I,
    fn: (codec: CodecLike, x: any) => CodecResult<any>,
): Result<O, Error> {
    let cow: O = input as any;
    for (const k in cow) {
        const v = cow[k];
        const r = fn(spec[k], v);
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

function Record<S extends RecordSpec>(spec: S): RecordCodec<S>;
function Record<S extends RecordSpec>(name: string, spec: S): RecordCodec<S>;
function Record<S extends RecordSpec>(...args: any[]): RecordCodec<S> {
    let name: string;
    let spec: S;

    if (typeof args[0] === 'string') {
        name = `Record(${args[0]})`;
        spec = args[1];
    } else {
        name = `Record`;
        spec = args[0];
    }

    return new Codec<unknown, RecordOutput<S>>(
        name,
        i => serdes(spec, i, (c, x) => c.parse(x)),
        o => serdes(spec, o, (c, x) => c.parse(x)),
    );
}

export { Record };
