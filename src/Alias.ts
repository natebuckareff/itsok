import { Codec, CodecResult } from './Codec';
import { Err } from './Result';
import { ParsingError, SerializationError } from './Errors';
import { Definition, ParamList, Reference, ArgList } from './SchemaDocument';

export class AliasCodec<C extends Codec.Any> extends Codec<
    C['I'],
    C['O'],
    C['P'],
    C['S'],
    C['Args']
> {
    private _noArgs: boolean;

    constructor(public alias: string, args: C['Args'], public codec: C) {
        super(
            alias,
            // If args is not explicitly passed in then forward the codec's args
            args === undefined ? codec.args : args,
            codec.parse,
            codec.serialize,
            codec,
        );
        this._noArgs = args === undefined;
    }

    parse = (input: Codec.Input<C>): CodecResult<Codec.Output<C>> => {
        const r = this.codec.parse(input);
        if (r.isError) {
            return Err(new ParsingError(this, r.error));
        }
        return r;
    };

    serialize = (parsed: Codec.Parsed<C>): CodecResult<Codec.Serialized<C>> => {
        const r = this.codec.serialize(parsed);
        if (r.isError) {
            return Err(new SerializationError(this, r.error));
        }
        return r;
    };

    public schemaOverride?: (codec: C) => Codec.Any;

    register() {
        if (this.schemaOverride) {
            return new AliasCodec(
                this.alias,
                this._noArgs ? undefined : this.args,
                this.schemaOverride(this.codec),
            );
        } else {
            return this;
        }
    }

    getDefinition(): Definition {
        if (this._noArgs) {
            const subst = new Map<Codec.Any, number>();
            const def: Definition = {
                type: 'Definition',
                name: this.name,

                // `this.ref!` because `!this.hasDefinition()` guarantees that `this.ref` is
                // defined
                reference: this.ref!.getReference(subst),
            };
            return def;
        } else {
            return super.getDefinition();
        }
    }

    getReference(subst?: Map<Codec.Any, number>): Reference {
        if (this._noArgs) {
            const ref: Reference = {
                type: 'Reference',
                name: this.name,
            };
            return ref;
        } else {
            return super.getReference(subst);
        }
    }
}

export function Alias<C extends Codec.Any, Args extends any[]>(
    alias: string,
    args: Args,
    codec: C,
): AliasCodec<C>;

export function Alias<C extends Codec.Any>(
    alias: string,
    codec: C,
): AliasCodec<C>;

export function Alias(alias: string, arg2: any, arg3?: any) {
    let args;
    let codec;

    if (arg3 === undefined) {
        args = undefined;
        codec = arg2;
    } else {
        args = arg2;
        codec = arg3;
    }

    return new AliasCodec(alias, args, codec);
}
