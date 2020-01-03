import { Codec, CodecResult2 } from './Codec';
import { Ok, Err } from './Result';
import { inspect } from 'util';
import { Undefined, String } from './Primitive';
import { Array } from './Array';
import { Union } from './Union';
import { Record } from './Record';

////////////////////////////////

// type Unionize<T extends any[]> = T[number];

// type UnionOutput<T extends any[]> = Unionize<
//     {
//         [K in keyof T]: CodecOutput2<T[K]>;
//     }
// >;

// type UnionParsed<T extends any[]> = Unionize<
//     {
//         [K in keyof T]: CodecParsed2<T[K]>;
//     }
// >;

// type UnionSerialized<T extends any[]> = Unionize<
//     {
//         [K in keyof T]: CodecSerialized2<T[K]>;
//     }
// >;

// type UnionCodec<Cs extends CodecLike2[]> = Codec<
//     unknown,
//     UnionOutput<Cs>,
//     UnionParsed<Cs>,
//     UnionSerialized<Cs>,
//     Cs,
//     never
// >;

// function Union<Cs extends CodecLike2[]>(...codecs: Cs): UnionCodec<Cs> {
//     type I = unknown;
//     type O = UnionOutput<Cs>;
//     type P = UnionParsed<Cs>;
//     type S = UnionSerialized<Cs>;
//     return Codec.from<I, O, P, S, Cs>(
//         'Union',
//         codecs,
//         u => Ok(u as any),
//         p => Ok(p as any),
//     );
// }

const U = Codec.alias(
    'User',
    Record({
        username: String,
    }),
);
// const x = U.parse({} as any).unwrap();

console.log(inspect(U.getDefinition(), true, null));
