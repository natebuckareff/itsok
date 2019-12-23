import { CodecLike } from './Codec';
import { GenericCodec } from './GenericCodec';
import { Undefined } from './Primitive';
import { Union } from './Union';

export function Option<C extends CodecLike>(codec: C) {
    const U = Union(codec, Undefined);
    return new GenericCodec('Option', [codec], U.parse, U.serialize);
}
