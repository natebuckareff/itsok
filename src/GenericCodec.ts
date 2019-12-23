/**
 * Helper that provides a default implementation of `schema()` that's good
 * enough for most codecs.
 */

import { Codec, CodecResult, CodecError } from './Codec';
import { GenericFactoryReference } from './SchemaDocument';

const LITERAL_CODECS: any = {
    null: 'Null',
    boolean: 'Boolean',
    number: 'Number',
    string: 'String',
};

export class GenericCodec<I, O, S, P extends any[] = []> extends Codec<
    I,
    O,
    S
> {
    constructor(
        public readonly name: string,
        public readonly params: P,
        public readonly parse: (i: I) => CodecResult<O>,
        public readonly serialize: (o: O) => CodecResult<S>,
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

    schemaReference() {
        const r: GenericFactoryReference = {
            type: 'GenericFactoryReference',
            name: this.name,
            args: [],
        };
        if (this.params.length > 0) {
            r.args = [];
            for (const param of this.params) {
                if (param instanceof Codec) {
                    r.args.push(param.schemaReference());
                } else {
                    const codec = LITERAL_CODECS[typeof param];
                    if (codec !== undefined) {
                        r.args.push({
                            type: 'Literal',
                            codec,
                            value: param,
                        });
                    } else {
                        throw new CodecError('Unknown literal type');
                    }
                }
            }
        }
        return r;
    }
}
