import { GenericCodec } from './GenericCodec';
import { Hex } from './Regex';
import { Try, Ok } from './Result';

export function _Buffer(encoding: BufferEncoding) {
    return new GenericCodec<string | Buffer, Buffer, [BufferEncoding]>(
        `Buffer(${encoding})`,
        [encoding],
        i => {
            if (Buffer.isBuffer(i)) {
                return Ok(i);
            } else {
                return Hex.parse(i).pipe(x =>
                    Try(() => Buffer.from(x, encoding)),
                );
            }
        },
        o => Try(() => o.toString(encoding)),
    );
}

export { _Buffer as Buffer };
