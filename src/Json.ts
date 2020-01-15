import { Codec } from './Codec';
import { CodecError } from './CodecError';
import { Try } from './Result';

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;

export interface JsonMap {
    [key: string]: AnyJson;
}

export interface JsonArray extends Array<AnyJson> {}

export const Json = Codec.from<string, AnyJson, AnyJson, string>(
    'Json',
    [],
    (x, codec) => {
        return Try(
            e => new CodecError(codec, `Failed to parse JSON`, e),
            () => JSON.parse(x),
        );
    },
    (x, codec) => {
        return Try(
            e => new CodecError(codec, `Failed to serialize JSON`, e),
            () => JSON.stringify(x),
        );
    },
);
