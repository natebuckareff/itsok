import { Codec, CodecResult } from './Codec';
import { Err } from './Result';
import { ParsingError, SerializationError } from './Errors';

export class AliasCodec<C extends Codec.Any, Args extends any[]> extends Codec<
    Codec.Input<C>,
    Codec.Output<C>,
    Codec.Parsed<C>,
    Codec.Serialized<C>,
    Args
> {
    constructor(alias: string, args: Args, public codec: C) {
        super(alias, args, codec);
    }

    parse(input: Codec.Input<C>): CodecResult<Codec.Output<C>> {
        const r = this.codec.parse(input);
        if (r.isError) {
            return Err(new ParsingError(this, r.error));
        }
        return r;
    }

    serialize(parsed: Codec.Parsed<C>): CodecResult<Codec.Serialized<C>> {
        const r = this.codec.serialize(parsed);
        if (r.isError) {
            return Err(new SerializationError(this, r.error));
        }
        return r;
    }
}

export function Alias<C extends Codec.Any, Args extends any[]>(
    alias: string,
    args: Args,
    codec: C,
): AliasCodec<C, Args>;

export function Alias<C extends Codec.Any>(
    alias: string,
    codec: C,
): AliasCodec<C, []>;

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
