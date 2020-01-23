import { Codec, CodecResult } from './Codec';

interface EmbeddedTuple<ArgsT extends any[]> {
    arr: ArgsT;
}

type EmbeddedCons<T, SubArgsT extends any[]> = ((
    arg1: T,
    ...rest: SubArgsT
) => any) extends (...args: infer R) => any
    ? EmbeddedTuple<R>
    : never;

type Cons<T, Ts extends any[]> = EmbeddedCons<T, Ts>['arr'];

// TODO Move to a utility file
function until<A, B>(
    xs: Iterable<A>,
    map: (a: A) => B,
    stop: (b: B) => boolean,
): B[] {
    const arr = [];
    for (const x of xs) {
        const y = map(x);
        arr.push(y);
        if (stop(y)) {
            break;
        }
    }
    return arr;
}

type Unionize<T extends any[]> = T[number];

type UnionOutput<T extends any[]> = Unionize<
    {
        [K in keyof T]: Codec.Output<T[K]>;
    }
>;

type UnionParsed<T extends any[]> = Unionize<
    {
        [K in keyof T]: Codec.Parsed<T[K]>;
    }
>;

type UnionSerialized<T extends any[]> = Unionize<
    {
        [K in keyof T]: Codec.Serialized<T[K]>;
    }
>;

export class UnionCodec<Cs extends Codec.Any[]> extends Codec<
    unknown,
    UnionOutput<Cs>,
    UnionParsed<Cs>,
    UnionSerialized<Cs>,
    Cs
> {
    constructor(codecs: Cs) {
        super(
            'Union',
            codecs,
            input => {
                const [codec, ...codecs] = this.args;
                let i = 0;
                let r = codec.parse(input);
                while (true) {
                    if (!r.isError || i >= codecs.length) {
                        break;
                    }
                    r = codecs[i].parse(input);
                    i += 1;
                }
                return r;
            },
            parsed => {
                // Try serializing with each codec until one returns a non-error
                // result
                const [codec, ...codecs] = this.args;
                return until(
                    [codec, ...codecs],
                    x => x.serialize(parsed),
                    x => !x.isError,
                ).slice(-1)[0];
            },
        );
    }
}

export function Union<C extends Codec.Any, CS extends Codec.Any[]>(
    codec: C,
    ...codecs: CS
): UnionCodec<Cons<C, CS>> {
    return new UnionCodec([codec, ...codecs]);
}
