/**
 * Helper that provides a default implementation of `schema()` that's good
 * enough for most codecs.
 */

import { Codec, CodecResult } from './Codec';
import { GenericFactoryReference, Reference } from './SchemaDocument';

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

    display() {
        if (this.params.length === 0) {
            return this.name;
        } else {
            const pnames = [];
            for (const x of this.params) {
                if (x instanceof Codec) {
                    pnames.push(x.display());
                } else {
                    pnames.push(x + '');
                }
            }
            return `${this.name}(${pnames.join(', ')})`;
        }
    }

    schema(): Reference {
        const ref: GenericFactoryReference = {
            type: 'GenericFactoryReference',
            name: this.name,
            args: [],
        };
        if (this.params.length > 0) {
            ref.args = [];
            for (const param of this.params) {
                if (param instanceof Codec) {
                    ref.args.push(param.schema());
                } else {
                    const codec = LITERAL_CODECS[typeof param];
                    if (codec !== undefined) {
                        ref.args.push({
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
