import { CodecLike, CodecInput, CodecSerialized } from './Codec';
import { GenericCodec } from './GenericCodec';
import { Ok } from './Result';

export function OneWay<C extends CodecLike>(codec: C) {
    type I = CodecInput<C>;
    type O = I;
    type A = S;
    type S = CodecSerialized<C>;
    return new GenericCodec<I, O, S, any[], A>(
        codec.name,
        [],
        i => codec.parse(i).pipe(() => Ok(i)),
        o => codec.serialize(o).pipe(() => Ok(o)),
    );
}
