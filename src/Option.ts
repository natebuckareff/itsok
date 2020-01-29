import { Alias } from './Alias';
import { Codec } from './Codec';
import { CodecError } from './CodecError';
import { Ok, Err } from './Result';
import { Union } from './Union';

// `null` on the wire and `undefined` at runtime
export const None = new Codec<unknown, undefined, undefined, null>(
    'None',
    undefined,
    function(i) {
        if (typeof i === 'undefined' || Object.is(i, null)) {
            return Ok(undefined);
        }
        return Err(
            new CodecError(
                this,
                `Expected either undefined or null, but got "${typeof i}"`,
            ),
        );
    },
    () => Ok(null),
);

export function Option<C extends Codec.Any>(codec: C) {
    return Alias('Option', [codec], Union(codec, None));
}
