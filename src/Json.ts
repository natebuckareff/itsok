import { Codec } from './Codec';
import { CodecError } from './CodecError';
import { Try } from './Result';

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;

export interface JsonMap {
    [key: string]: AnyJson;
}

export interface JsonArray extends Array<AnyJson> {}

export const Json = new Codec<string, AnyJson, AnyJson, string>(
    'Json',
    [],
    function(x) {
        return Try(
            e => new CodecError(this, `Failed to parse JSON`, e),
            () => JSON.parse(x),
        );
    },
    function(x) {
        return Try(
            e => new CodecError(this, `Failed to serialize JSON`, e),
            () => JSON.stringify(x),
        );
    },
);
