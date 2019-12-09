import { Codec, CodecLike, CodecInput, CodecOutput } from './Codec';

export function Flip<C extends CodecLike>(codec: C) {
    type I = CodecInput<C>;
    type O = CodecOutput<C>;
    return new Codec<O, I>(`Flip${codec.name}`, codec.serialize, codec.parse);
}
