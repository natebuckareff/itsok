import { Alias } from './Alias';
import { Codec } from './Codec';
import { Undefined } from './Primitive';
import { Union } from './Union';

export function Option<C extends Codec.Any>(codec: C) {
    return Alias('Option', [codec], Union(codec, Undefined));
}
