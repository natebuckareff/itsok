import { Codec, CodecError } from './Codec';
import { Try } from './Result';

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;

export interface JsonMap {
    [key: string]: AnyJson;
}

export interface JsonArray extends Array<AnyJson> {}

export const Json = new Codec<string, AnyJson, string>(
    `Json`,
    i =>
        Try(
            e => new CodecError(`Failed to parse JSON`, e),
            () => JSON.parse(i),
        ),
    o =>
        Try(
            e => new CodecError(`Failed to serialize JSON`, e),
            () => JSON.stringify(o),
        ),
);
