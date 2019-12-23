import { Codec, CodecLike } from './Codec';
import { GenericCodec } from './GenericCodec';

export type Unionize<T extends any[]> = T[number];

export type UnionOutputTuple<T extends any[]> = {
    [K in keyof T]: T[K] extends Codec<any, infer O> ? O : any;
};

export type UnionOutput<T extends any[]> = Unionize<UnionOutputTuple<T>>;

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
    CS
>;

function Union<C extends CodecLike, CS extends CodecLike[]>(
    codec: C,
    ...codecs: CS
): UnionCodec<Cons<C, CS>>;

function Union<C extends CodecLike, CS extends CodecLike[]>(
    alias: string,
    codec: C,
    ...codecs: CS
): UnionCodec<Cons<C, CS>>;

function Union<C extends CodecLike, CS extends CodecLike[]>(...args: any[]) {
    let alias: string | null;
    let codec: CodecLike;
    let codecs: CS;

    if (typeof args[0] === 'string') {
        alias = args[0];
        codec = args[1];
        codecs = args.slice(2) as any;
    } else {
        alias = null;
        codec = args[0];
        codecs = args.slice(1) as any;
    }

    return new GenericCodec<unknown, UnionOutput<Cons<C, CS>>, Cons<C, CS>>(
        alias || 'Union',
        [codec, ...codecs] as Cons<C, CS>,
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

export { Union };
