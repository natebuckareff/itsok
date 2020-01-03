import { Codec } from './Codec';
import { Undefined } from './Primitive';
import { Union } from './Union';

export function Option<C extends Codec.Like>(codec: C) {
    return Codec.ref('Option', [codec], Union(codec, Undefined));
}
