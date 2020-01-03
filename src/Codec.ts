import { Result, Ok, Err } from './Result';

export class CodecError extends Error {
    constructor(message: string, public readonly cause?: Error) {
        super(message);
        this.name = 'CodecError';
    }

    chain(): CodecError[] {
        const r: CodecError[] = [this];
        if (this.cause instanceof CodecError) {
            r.push(...this.cause.chain());
        }
        return r;
    }
}

export type CodecResult2<T> = Result<T, Error>;

export class Codec<I, O, P, S, Args extends any[], BR extends Codec.Like> {
    constructor(
        private _name: string,
        private _args: Args,
        private _backref?: BR,
    ) {}

    static from<I, O, P, S, Args extends any[] = any[]>(
        name: string,
        args: Args,
        parse: (input: I) => CodecResult2<O>,
        serialize: (input: P) => CodecResult2<S>,
    ) {
        const codec = new Codec<I, O, P, S, Args, never>(name, args);
        codec.parse = parse;
        codec.serialize = serialize;
        return codec;
    }

    static ref<Args extends any[], C extends Codec.Like>(
        name: string,
        args: Args,
        backref: C,
    ) {
        type I = Codec.InputT<C>;
        type O = Codec.OutputT<C>;
        type P = Codec.ParsedT<C>;
        type S = Codec.SerializedT<C>;
        const codec = new Codec<I, O, P, S, Args, C>(name, args, backref);
        codec.parse = backref.parse;
        codec.serialize = backref.serialize;
        return codec;
    }

    static alias<C extends Codec.Like>(name: string, codec: C) {
        return this.ref(name, [], codec);
    }

    get name() {
        return this._name;
    }

    get args() {
        return this._args;
    }

    get backref() {
        return this._backref;
    }

    pipe<C extends Codec.Like>(codec: C) {
        type _O = Codec.OutputT<C>;
        type _P = Codec.ParsedT<C>;
        return Codec.from<I, _O, _P, S>(
            '_pipe',
            [this, codec],
            i => this.parse(i).pipe(codec.parse),
            p => codec.serialize(p).pipe(this.serialize),
        );
    }

    check(cond: (o: O) => boolean) {
        return Codec.from<I, O, P, S>(
            '_check',
            [this],
            i =>
                this.parse(i).pipe(x =>
                    cond(x) ? Ok(x) : Err(Error('error')),
                ),
            this.serialize,
        );
    }

    parse(_input: I): CodecResult2<O> {
        throw Error('Not Implemented');
    }

    serialize(_parsed: P): CodecResult2<S> {
        throw Error('Not Implemented');
    }

    getDefinition(): Definition {
        if (this.backref === undefined) {
            throw Error('Expected codec back reference');
        }

        const params: ParamList = [];
        const args: ArgList = [];

        const ref: Reference = {
            type: 'Reference',
            name: this.backref.name,
            args,
        };

        const def: Definition = {
            type: 'Definition',
            name: this.name,
            params,
            reference: ref,
        };

        const argmap = new Map();
        for (const [k, arg] of this.args) {
            argmap.set(arg, k);
            if (arg instanceof Codec) {
                params.push('Reference');
            } else {
                params.push('Literal');
            }
        }
        if (params.length === 0) {
            delete def.params;
        }

        for (const arg of this.backref.args) {
            if (argmap.has(arg)) {
                args.push({ type: 'Param', param: argmap.get(arg) });
            } else {
                if (arg instanceof Codec) {
                    args.push(arg.getReference());
                } else {
                    const typename = typeof arg;
                    args.push({
                        type: 'Literal',
                        kind: typename,
                        value: arg,
                    });
                }
            }
        }
        if (ref.args?.length === 0) {
            delete ref.args;
        }

        return def;
    }

    getReference(): Reference {
        const args: ArgList = [];
        const ref: Reference = {
            type: 'Reference',
            name: this.name,
            args,
        };
        for (const arg of this.args) {
            if (arg instanceof Codec) {
                args.push(arg.getReference());
            } else {
                const typename = typeof arg;
                args.push({
                    type: 'Literal',
                    kind: typename,
                    value: arg,
                });
            }
        }
        if (args.length === 0) {
            delete ref.args;
        }
        return ref;
    }
}

export namespace Codec {
    export type InputT<C> = C extends Codec<infer I, any, any, any, any[], any>
        ? I
        : never;

    export type OutputT<C> = C extends Codec<any, infer O, any, any, any[], any>
        ? O
        : never;

    export type ParsedT<C> = C extends Codec<any, any, infer P, any, any[], any>
        ? P
        : never;

    export type SerializedT<C> = C extends Codec<
        any,
        any,
        any,
        infer S,
        any[],
        any
    >
        ? S
        : never;

    export type Like = Codec<any, any, any, any, any[], any>;
}

export interface SchemaDocument2 {
    type: 'SchemaDocument';
    definitions: Definition[];
}

export interface Definition {
    type: 'Definition';
    name: string;
    params?: ParamList;
    reference: Reference;
}

export type ParamList = ('Literal' | 'Reference')[];

export interface Reference {
    type: 'Reference';
    name: string;
    args?: ArgList;
}

export type ArgList = Arg[] | { [arg: string]: Arg };
export type Arg = Literal | Reference | Param;
export type Param = { type: 'Param'; param: number };

export interface Literal {
    type: 'Literal';
    kind: string;
    value: any;
}
