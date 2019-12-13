import { CodecResult, CodecLike, CodecOutput, CodecError } from './Codec';
import { GenericCodec } from './GenericCodec';
import { Ok, Err } from './Result';

function serdes<C extends CodecLike, I, O>(
    codec: C,
    input: I,
    fn: (codec: CodecLike, x: any) => CodecResult<any>,
): CodecResult<O[]> {
    let cow: O[] = input as any;
    for (let i = 0; i < cow.length; ++i) {
        const x = cow[i];
        const r = fn(codec, x);
        if (r.isError) {
            return Err(
                new CodecError(`Expected array of ${codec.name}`, r.error),
            );
        }
        if (r.success !== x) {
            if ((input as any) === cow) {
                cow = [...(input as any)];
            }
            cow[i] = r.success;
        }
    }
    return Ok(cow);
}

function _Array<C extends CodecLike>(codec: C) {
    return new GenericCodec<unknown, CodecOutput<C>[], [C]>(
        `Array`,
        [codec],
        i => {
            if (!Array.isArray(i)) {
                return Err(new Error('Expected array'));
            }
            return serdes(codec, i, (c, x) => c.parse(x));
        },
        o => serdes(codec, o, (c, x) => c.parse(x)),
    );
}

export { _Array as Array };
