import { Number } from './Numeric';
import { Ok, Try } from './Result';
import { PrimitiveCodec } from './Primitive';

export const UnixMilliseconds = new PrimitiveCodec<number, Date>(
    'UnixMilliseconds',
    i => Number.parse(i).pipe(x => Ok(new Date(x))),
    o => Try(() => o.getTime()),
);
