import { GenericCodec } from './GenericCodec';
import { Regex } from './Regex';
import { Try, Ok } from './Result';

// TODO Not liking how much line noise there is with GenericCodec

// TODO Rename Bytes.ts -> Buffer.ts

function _Buffer(encoding: BufferEncoding) {
    return new GenericCodec<
        string | Buffer,
        Buffer,
        string,
        [BufferEncoding],
        Buffer | string
    >(
        `Buffer`,
        [encoding],
        i => {
            if (Buffer.isBuffer(i)) {
                return Ok(i);
            } else if (encoding === 'hex') {
                return Regex.Hex.parse(i).pipe(x =>
                    Try(() => Buffer.from(x, encoding)),
                );
            } else if (encoding === 'base64') {
                return Regex.Base64.parse(i).pipe(x =>
                    Try(() => Buffer.from(x, encoding)),
                );
            } else {
                return Try(() => Buffer.from(i, encoding));
            }
        },
        o =>
            Try(() => {
                if (typeof o === 'string') {
                    return Buffer.from(o, 'utf8').toString(encoding);
                } else {
                    return o.toString(encoding);
                }
            }),
    );
}
export { _Buffer as Buffer };
