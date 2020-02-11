import { Codec } from './Codec';
import { Ok, Try } from './Result';
import { Regex } from './Regex';

function _Buffer(encoding: BufferEncoding) {
    type I = Buffer | string;
    type O = Buffer;
    return new Codec<I, O, O, string>(
        'Buffer',
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
        o => Try(() => o.toString(encoding)),
    );
}
export { _Buffer as Buffer };

export type StringEncoding = 'hex' | 'base64' | 'uri';

export function EncodedString(encoding: StringEncoding) {
    return new Codec<string, string, string, string>(
        'EncodedString',
        [encoding],
        i => {
            if (encoding === 'uri') {
                return Try(() => decodeURIComponent(i));
            } else {
                return Try(() => Buffer.from(i, encoding).toString('utf-8'));
            }
        },
        o => {
            if (encoding === 'uri') {
                return Try(() => encodeURIComponent(o));
            } else {
                return Try(() => Buffer.from(o, 'utf-8').toString(encoding));
            }
        },
    );
}
