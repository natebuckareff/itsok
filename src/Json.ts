import { Codec } from './Codec';
import { Try } from './Result';

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;

export interface JsonMap {
    [key: string]: AnyJson;
}

export interface JsonArray extends Array<AnyJson> {}

export const Json = new Codec<string, AnyJson, string>(
    `Json`,
    i => Try(() => JSON.parse(i)),
    o => Try(() => JSON.stringify(o)),
);
