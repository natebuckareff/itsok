/**
 * Helper that provides a default implementation of `schema()` that's good
 * enough for most codecs.
 */

import { Codec, CodecResult } from './Codec';
import { CodecReference } from './SchemaDocument';

const LITERAL_CODECS: any = {
    null: 'Null',
    boolean: 'Boolean',
    number: 'Number',
    string: 'String',
};

export class GenericCodec<I, O, P extends any[] = []> extends Codec<I, O> {
    constructor(
        public readonly name: string,
        public readonly params: P,
        public readonly parse: (i: I) => CodecResult<O>,
        public readonly serialize: (o: O) => CodecResult<I>,
    ) {
        super(name, parse, serialize);
    }

    schema(): CodecReference {
        const ref: CodecReference = {
            type: 'CodecReference',
            name: this.name,
        };
        if (this.params.length > 0) {
            ref.parameters = [];
            for (const param of this.params) {
                if (param instanceof Codec) {
                    ref.parameters.push(param.schema());
                } else {
                    const codec = LITERAL_CODECS[typeof param];
                    if (codec !== undefined) {
                        ref.parameters.push({
                            type: 'Literal',
                            codec,
                            value: param,
                        });
                    } else {
                        throw new Error('Unknown literal type');
                    }
                }
            }
        }
        return ref;
    }
}
