import { CodecLike, CodecInput, CodecOutput } from './Codec';
import { GenericCodec } from './GenericCodec';

export function Flip<C extends CodecLike>(codec: C) {
    type I = CodecInput<C>;
    type O = CodecOutput<C>;
    return new GenericCodec<O, I, [C]>(
        `Flip${codec.name}`,
        [codec],
        codec.serialize,
        codec.parse,
    );
}
