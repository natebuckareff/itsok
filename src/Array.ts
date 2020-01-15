import { Codec, CodecResult } from './Codec';
import { CodecError } from './CodecError';
import { Ok, Err } from './Result';

export class ArrayCode<C extends Codec.Any> extends Codec<
    unknown,
    Codec.Output<C>[],
    Codec.Parsed<C>[],
    Codec.Serialized<C>[],
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
        fn: (x: any) => CodecResult<any>,
    ): CodecResult<O[]> => {
        let cow: O[] = input as any;
        for (let i = 0; i < cow.length; ++i) {
            const x = cow[i];
            const r = fn(x);
            if (r.isError) {
                return Err(
                    new CodecError(
                        this,
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

    parse(input: unknown): CodecResult<Codec.Output<C>[]> {
        if (!Array.isArray(input)) {
            return Err(new CodecError(this, 'Expected array'));
        }
        return this.serdes(input, x => this.codec.parse(x));
    }

    serialize(parsed: Codec.Parsed<C>[]): CodecResult<Codec.Serialized<C>[]> {
        return this.serdes(parsed, x => this.codec.parse(x));
    }
}

function _Array<C extends Codec.Any>(codec: C) {
    return new ArrayCode(codec);
}
export { _Array as Array };
