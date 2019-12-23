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

type UnionCodec<CS extends CodecLike[]> = GenericCodec<
    unknown,
    UnionOutput<CS>,
    UnionSerialized<CS>,
    CS
>;

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
                if (r.success || i >= codecs.length) {
                    break;
                }
                r = codecs[i].parse(unk);
                i += 1;
            }
            return r;
        },
        o => {
            const r = codec.serialize(o);
            while (true) {
                if (r.success) {
                    break;
                }
            }
            return r;
        },
    );
}
