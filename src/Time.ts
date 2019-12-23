import { Codec } from './Codec';
import { Number } from './Numeric';
import { Ok, Try } from './Result';

export const UnixMilliseconds = new Codec<number, Date>(
    'UnixMilliseconds',
    i => Number.parse(i).pipe(x => Ok(new Date(x))),
    o => Try(() => o.getTime()),
);
