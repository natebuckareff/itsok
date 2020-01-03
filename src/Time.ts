import { Codec } from './Codec';
import { Number } from './Numeric';
import { Ok, Try } from './Result';

export const UnixMilliseconds = Codec.from<number, Date, Date, number>(
    'UnixMilliseconds',
    [],
    i => Number.parse(i).pipe(x => Ok(new Date(x))),
    o => Try(() => o.getTime()),
);
