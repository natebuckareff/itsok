import { Codec, CodecError } from './Codec';
import { Ok, Err } from './Result';
import { String } from './Primitive';

export function Regex(re: RegExp) {
    return Codec.from(
        'Regex',
        [re],
        u => {
            return String.parse(u).pipe(s => {
                if (!re.test(s)) {
                    return Err(
                        new CodecError(
                            `Regex pattern '${re.source}' failed to match '${s}'`,
                        ),
                    );
                }
                return Ok(s);
            });
        },
        Ok,
    );
}

export namespace Regex {
    export const Float = Codec.alias(
        'Regex.Float',
        Regex(/^[+-]?(([0-9]*\.[0-9]+)|([0-9]+(\.[0-9]*)?))(e[+-]?[0-9]+)?$/),
    );

    export const Integer = Codec.alias('Regex.Integer', Regex(/^[+-]?[0-9]+$/));

    export const Hex = Codec.alias('Regex.Hex', Regex(/^[a-zA-Z0-9]+$/));

    export const Base64 = Codec.alias(
        'Regex.Base64',
        Regex(/^[a-zA-Z0-9_=-]+$/),
    );
}
