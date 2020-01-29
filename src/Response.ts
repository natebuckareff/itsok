import { Codec } from './Codec';
import { CodecError } from './CodecError';
import { Ok, Err } from './Result';
import { Record } from './Record';
import { Undefined } from './Primitive';
import { Union } from './Union';

export function Response<D extends Codec.Any, E extends Codec.Any>(
    dataCodec: D,
    errorCodec: E,
) {
    const Resp = Record({
        data: Union(Undefined, dataCodec),
        error: Union(Undefined, errorCodec),
    });
    type I = typeof Resp['I'];
    type O = D['O'];
    type P = D['O'] | E['O'];
    type S = typeof Resp['S'];
    return new Codec<I, O, P, S, [D, E]>(
        'Response',
        [dataCodec, errorCodec],
        function(i) {
            return Resp.parse(i).pipe(x => {
                if (x.error !== undefined) {
                    return Err(
                        new CodecError(this, 'Invalid response', x.error),
                    );
                }
                return Ok(x.data as O);
            });
        },
        o => {
            if ((o as any) instanceof Error) {
                return errorCodec
                    .serialize(o)
                    .pipe(error => Ok({ data: undefined, error }));
            } else {
                return dataCodec
                    .serialize(o)
                    .pipe(data => Ok({ data, error: undefined }));
            }
        },
    );
}
