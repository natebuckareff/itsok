import { GenericCodec } from './GenericCodec';
import { Hex } from './Regex';
import { PrimitiveCodec } from './Primitive';
import { Try, Ok, Err } from './Result';

export function StringBytes(encoding: BufferEncoding) {
    return new GenericCodec<string, Buffer, [BufferEncoding]>(
        `StringBytes(${encoding})`,
        [encoding],
        i => Hex.parse(i).pipe(x => Try(() => Buffer.from(x, encoding))),
        o => Try(() => o.toString(encoding)),
    );
}

const _Buffer = new PrimitiveCodec<unknown, Buffer>(
    'Buffer',
    i => {
        return Buffer.isBuffer(i)
            ? Ok(i as Buffer)
            : Err(new Error('Expected Buffer'));
    },
    Ok,
);
export { _Buffer as Buffer };
