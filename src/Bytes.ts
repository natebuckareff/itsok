import { Codec } from './Codec';
import { Hex } from './Regex';
import { Try } from './Result';

export function StringBytes(encoding: BufferEncoding) {
    return new Codec<string, Buffer>(
        `StringBytes(${encoding})`,
        i => Hex.parse(i).pipe(x => Try(() => Buffer.from(x, encoding))),
        o => Try(() => o.toString(encoding)),
    );
}
