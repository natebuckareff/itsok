import { Alias } from './Alias';
import { Codec } from './Codec';
import { CodecError } from './CodecError';
import { Ok, Err } from './Result';
import { String } from './Primitive';

export function Regex(re: RegExp) {
    return Codec.from<unknown, string, string, string, [RegExp]>(
        'Regex',
        [re],
        (u, codec) => {
            return String.parse(u).pipe(s => {
                if (!re.test(s)) {
                    return Err(
                        new CodecError(
                            codec,
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
    export const Float = Alias(
        'Regex.Float',
        Regex(/^[+-]?(([0-9]*\.[0-9]+)|([0-9]+(\.[0-9]*)?))(e[+-]?[0-9]+)?$/),
    );

    export const Integer = Alias('Regex.Integer', Regex(/^[+-]?[0-9]+$/));
    export const Hex = Alias('Regex.Hex', Regex(/^[a-zA-Z0-9]+$/));
    export const Base64 = Alias('Regex.Base64', Regex(/^[a-zA-Z0-9_=-]+$/));
}
