import { Codec } from './Codec';
import { Undefined } from './Primitive';
import { Union } from './Union';
import { Alias } from './Alias';

export function Option<C extends Codec.Any>(codec: C) {
    return Alias('Option', [codec], Union(codec, Undefined));
}
