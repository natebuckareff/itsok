import { Codec } from './Codec';
import { Ok, Try } from './Result';
import { Regex } from './Regex';

// TODO Rename Bytes.ts -> Buffer.ts

function _Buffer(encoding: BufferEncoding) {
    return Codec.from(
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
        Ok,
    );
}
export { _Buffer as Buffer };
