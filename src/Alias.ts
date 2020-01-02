import { GenericCodec } from './GenericCodec';
import { Reference } from './SchemaDocument';

import {
    CodecLike,
    CodecInput,
    CodecOutput,
    CodecSerialized,
    CodecA,
} from './Codec';

export class AliasCodec<C extends CodecLike> extends GenericCodec<
    CodecInput<C>,
    CodecOutput<C>,
    CodecSerialized<C>,
    [C],
    CodecA<C>
> {
    constructor(alias: string, public readonly codec: C) {
        super(alias, [codec], codec.parse, codec.serialize);
    }

    hasSchemaDefinition(): boolean {
        return true;
    }

    schemaReference(): Reference {
        return {
            type: 'CodecReference',
            name: this.name,
        };
    }

    schemaDefinition(): Reference {
        return this.codec.schemaReference();
    }
}

export function Alias<C extends CodecLike>(alias: string, codec: C) {
    return new AliasCodec(alias, codec);
}
