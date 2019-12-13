import { Alias } from './Codec';
import { GenericCodec } from './GenericCodec';
import { Ok, Err } from './Result';
import { String } from './Primitive';

export function Regex(re: RegExp) {
    return new GenericCodec<unknown, string, [string]>(
        `Regex`,
        [re.source],
        u => {
            return String.parse(u).pipe(s => {
                if (!re.test(s)) {
                    return Err(
                        new Error(
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
    export const Hex = Alias('Regex.Hex', Regex(/^[a-zA-Z0-9]+$/));
}
