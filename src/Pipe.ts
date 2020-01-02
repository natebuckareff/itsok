import { GenericCodec } from './GenericCodec';

import {
    CodecLike,
    CodecInput,
    CodecOutput,
    CodecA,
    CodecSerialized,
    Codec,
} from './Codec';

export type PipeCodec<I extends CodecLike, O extends CodecLike> = Codec<
    CodecInput<I>,
    CodecOutput<O>,
    CodecSerialized<I>,
    CodecA<O>
>;

export function Pipe<Input extends CodecLike, Output extends CodecLike>(
    a: Input,
    b: Output,
) {
    type I = CodecInput<Input>;
    type S = CodecSerialized<Input>;
    type O = CodecOutput<Output>;
    type A = CodecA<Output>;
    return new GenericCodec<I, O, S, [Input, Output], A>(
        'Pipe',
        [a, b],
        i => a.parse(i).pipe(b.parse),
        o => b.serialize(o).pipe(a.serialize),
    );
}
