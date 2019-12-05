import { GenericCodec } from './GenericCodec';
import { Hex } from './Regex';
import { Try } from './Result';

export function StringBytes(encoding: BufferEncoding) {
    return new GenericCodec<string, Buffer, [BufferEncoding]>(
        `StringBytes(${encoding})`,
        [encoding],
        i => Hex.parse(i).pipe(x => Try(() => Buffer.from(x, encoding))),
        o => Try(() => o.toString(encoding)),
    );
}
