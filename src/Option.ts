import { CodecLike } from './Codec';
import { GenericCodec } from './GenericCodec';
import { Undefined } from './Primitive';
import { Union, UnionCodec } from './Union';

export function Option<C extends CodecLike>(
    codec: C,
): UnionCodec<[C, typeof Undefined]> {
    const U = Union(codec, Undefined);
    return new GenericCodec('Option', [codec], U.parse, U.serialize) as any;
}
