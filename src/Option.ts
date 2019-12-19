import { CodecLike } from './Codec';
import { Undefined } from './Primitive';
import { Union } from './Union';

export function Option<C extends CodecLike>(codec: C) {
    return Union(codec, Undefined);
}
