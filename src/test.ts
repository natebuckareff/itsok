import { Codec, CodecResult } from './Codec';
import { Ok, Err, Result } from './Result';
import { inspect } from 'util';
import { Undefined, String } from './Primitive';
import { Array } from './Array';
import { Union } from './Union';
import { Record } from './Record';
import { Option } from './Option';
import { Number } from './Numeric';

// function U<C extends Codec.Like>(c: C) {
//     return Codec.ref(
//         'User',
//         [c],
//         Record({
//             username: Codec.copy(c),
//             payload: String,
//         }),
//     );
// }

function Response<C extends Codec.Like>(codec: C) {
    const Resp = Record({
        data: Union(Undefined, codec),
        error: Union(Undefined, Record({ message: String })),
    });
    type I = Codec.InputT<typeof Resp>;
    type O = Codec.OutputT<C>;
    type S = Codec.SerializedT<typeof Resp>;
    return Codec.from<I, O, O, S, [C]>(
        'Response',
        [codec],
        i => {
            return Resp.parse(i).pipe(x => {
                if (x.error !== undefined) {
                    return Err(new Error(x.error.message));
                }
                return Ok(x.data as O);
            });
        },
        o => {
            return codec
                .serialize(o)
                .pipe(x => Ok({ data: x.data, error: undefined }));
        },
    );
}

const R = Response(Option(String));
const i = {
    data: null,
};

const x = R.parse(i).unwrap();
console.log(x);

// console.log(inspect(UU.getDefinition(), true, null));
