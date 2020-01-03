import { Codec, CodecResult2, CodecError } from './Codec';
import { Ok, Err } from './Result';

export class ArrayCode<C extends Codec.Like> extends Codec<
    unknown,
    Codec.OutputT<C>[],
    Codec.ParsedT<C>[],
    Codec.SerializedT<C>[],
    [C],
    never
> {
    constructor(codec: C) {
        super('Array', [codec]);
    }

    get codec() {
        return this.args[0];
    }

    private serdes = <I, O>(
        input: I,
        fn: (x: any) => CodecResult2<any>,
    ): CodecResult2<O[]> => {
        let cow: O[] = input as any;
        for (let i = 0; i < cow.length; ++i) {
            const x = cow[i];
            const r = fn(x);
            if (r.isError) {
                return Err(
                    new CodecError(
                        `Expected array of ${this.codec.name}`,
                        r.error,
                    ),
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
    };

    parse(input: unknown): CodecResult2<Codec.OutputT<C>[]> {
        if (!Array.isArray(input)) {
            return Err(new CodecError('Expected array'));
        }
        return this.serdes(input, x => this.codec.parse(x));
    }

    serialize(
        parsed: Codec.ParsedT<C>[],
    ): CodecResult2<Codec.SerializedT<C>[]> {
        return this.serdes(parsed, x => this.codec.parse(x));
    }
}

function _Array<C extends Codec.Like>(codec: C) {
    return new ArrayCode(codec);
}
export { _Array as Array };
