import { CodecLike, CodecInput, CodecOutput, CodecSerialized } from './Codec';
import { GenericCodec } from './GenericCodec';

export function Flip<C extends CodecLike>(codec: C) {
    type I = CodecInput<C>;
    type O = CodecOutput<C>;
    type S = CodecSerialized<C>;
    return new GenericCodec<O, I, S, [C]>(
        `Flip${codec.name}`,
        [codec],
        codec.serialize,
        codec.parse,
    );
}
