import { Codec, CodecError } from './Codec';
import { Try } from './Result';

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;

export interface JsonMap {
    [key: string]: AnyJson;
}

export interface JsonArray extends Array<AnyJson> {}

export const Json = Codec.from<string, AnyJson, AnyJson, string>(
    'Json',
    [],
    x => {
        return Try(
            e => new CodecError(`Failed to parse JSON`, e),
            () => JSON.parse(x),
        );
    },
    x => {
        return Try(
            e => new CodecError(`Failed to serialize JSON`, e),
            () => JSON.stringify(x),
        );
    },
);
