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

export type CodecResult<T> = Result<T, Error>;

export class Codec<I, O, P, S, Args, BR extends Codec.Like> {
    constructor(
        private _name: string,
        private _args: Args,
        private _backref?: BR,
    ) {}

    static copy<C extends Codec.Like>(codec: C): C {
        const copy = new Codec(codec.name, codec.args, codec.backref);
        copy.parse = codec.parse;
        copy.serialize = codec.serialize;
        return copy as C;
    }

    static from<I, O, P, S, Args = any>(
        name: string,
        args: Args,
        parse: (input: I) => CodecResult<O>,
        serialize: (input: P) => CodecResult<S>,
    ) {
        const codec = new Codec<I, O, P, S, Args, never>(name, args);
        codec.parse = parse;
        codec.serialize = serialize;
        return codec;
    }

    static ref<Args, C extends Codec.Like>(
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

    get backref() {
        return this._backref;
    }

    get args() {
        return this._args;
    }

    visitArgs(visitor: (x: any, k: number | string) => void) {
        if (Array.isArray(this.args)) {
            for (let i = 0; i < this.args.length; ++i) {
                visitor(this.args[i], i);
            }
        } else {
            for (const k in this.args) {
                visitor(this.args[k], k);
            }
        }
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

    parse(_input: I): CodecResult<O> {
        throw Error('Not Implemented');
    }

    serialize(_parsed: P): CodecResult<S> {
        throw Error('Not Implemented');
    }

    getDefinition(): Definition {
        if (this.backref === undefined) {
            throw new Error('');
        }

        const params: ParamList = [];
        const subst = new Map<Codec.Like, number>();
        this.visitArgs(arg => {
            subst.set(arg, params.length);
            if (arg instanceof Codec) {
                params.push('Reference');
            } else {
                params.push('Literal');
            }
        });

        const def: Definition = {
            type: 'Definition',
            name: this.name,
            params,
            reference: this.backref.getReference(subst),
        };

        return def;
    }

    getReference(subst?: Map<Codec.Like, number>): Reference {
        const args: ArgList = [];
        const ref: Reference = {
            type: 'Reference',
            name: this.name,
            args,
        };
        this.visitArgs(arg => {
            if (subst && subst.has(arg)) {
                args.push({ type: 'Param', param: subst.get(arg)! });
            } else if (arg instanceof Codec) {
                args.push(arg.getReference(subst));
            } else {
                const typename = typeof arg;
                args.push({
                    type: 'Literal',
                    kind: typename,
                    value: arg,
                });
            }
        });
        if (args.length === 0) {
            delete ref.args;
        }
        return ref;
    }
}

export namespace Codec {
    export type InputT<C> = C extends Codec<infer I, any, any, any, any, any>
        ? I
        : never;

    export type OutputT<C> = C extends Codec<any, infer O, any, any, any, any>
        ? O
        : never;

    export type ParsedT<C> = C extends Codec<any, any, infer P, any, any, any>
        ? P
        : never;

    export type SerializedT<C> = C extends Codec<
        any,
        any,
        any,
        infer S,
        any,
        any
    >
        ? S
        : never;

    export type Like = Codec<any, any, any, any, any, any>;
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
