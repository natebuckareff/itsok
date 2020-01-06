import { Codec } from './Codec';
import { Try } from './Result';

export const URIEncoded = new Codec<string, string>(
    'URIEncoded',
    i => Try(() => decodeURIComponent(i)),
    o => Try(() => encodeURIComponent(o)),
);
