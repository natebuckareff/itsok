import { Array } from './Array';
import { Codec } from './Codec';
import { CodecError } from './CodecError';
import { Ok, Err } from './Result';

export function NonEmptyArray<C extends Codec.Any>(codec: C) {
    const array = Array(codec);
    type I = typeof array['I'];
    type O = typeof array['O'];
    type P = typeof array['P'];
    type S = typeof array['S'];
    return new Codec<I, O, P, S>(
        'NonEmptyArray',
        [codec],
        function(i) {
            return array.parse(i).pipe(x => {
                if (x.length === 0) {
                    return Err(
                        new CodecError(this, `Expected non-empty array`),
                    );
                }
                return Ok(x);
            });
        },
        array.serialize,
    );
}
