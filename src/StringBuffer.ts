import { Codec } from './Codec';
import { Ok, Try } from './Result';
import { Regex } from './Regex';

export function StringBuffer(encoding: BufferEncoding) {
    type I = Buffer | string;
    type O = Buffer;
    return new Codec<I, O, O, string>(
        'StringBuffer',
        [encoding],
        input => {
            if (Buffer.isBuffer(input)) {
                return Ok(input);
            } else if (encoding === 'hex') {
                return Regex.Hex.parse(input).pipe(x =>
                    Try(() => Buffer.from(x, encoding)),
                );
            } else if (encoding === 'base64') {
                return Regex.Base64.parse(input).pipe(x =>
                    Try(() => Buffer.from(x, encoding)),
                );
            } else {
                return Try(() => Buffer.from(input as any, encoding));
            }
        },
        o => Try(() => o.toString()),
    );
}
