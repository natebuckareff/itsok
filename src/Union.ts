import { Codec, CodecLike } from './Codec';
import { GenericCodec } from './GenericCodec';

export type Unionize<T extends any[]> = T[number];

export type UnionOutputTuple<T extends any[]> = {
    [K in keyof T]: T[K] extends Codec<any, infer O> ? O : any;
};

export type UnionSerializedTuple<T extends any[]> = {
    [K in keyof T]: T[K] extends Codec<any, any, infer S> ? S : any;
};

export type UnionOutput<T extends any[]> = Unionize<UnionOutputTuple<T>>;
export type UnionSerialized<T extends any[]> = Unionize<
    UnionSerializedTuple<T>
>;

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

export type UnionCodec<CS extends CodecLike[]> = GenericCodec<
    unknown,
    UnionOutput<CS>,
    UnionSerialized<CS>,
    CS
>;

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

export function Union<C extends CodecLike, CS extends CodecLike[]>(
    codec: C,
    ...codecs: CS
): UnionCodec<Cons<C, CS>> {
    type T = Cons<C, CS>;
    type O = UnionOutput<T>;
    type S = UnionSerialized<T>;

    return new GenericCodec<unknown, O, S, T>(
        'Union',
        [codec, ...codecs] as T,
        unk => {
            let i = 0;
            let r = codec.parse(unk);
            while (true) {
                if (!r.isError || i >= codecs.length) {
                    break;
                }
                r = codecs[i].parse(unk);
                i += 1;
            }
            return r;
        },
        o => {
            // Try serializing with each codec until one returns a non-error
            // result
            return until(
                [codec, ...codecs],
                x => x.serialize(o),
                x => !x.isError,
            ).slice(-1)[0];
        },
    );
}
