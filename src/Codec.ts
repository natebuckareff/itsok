import { CodecError } from './CodecError';
import { Definition, ParamList, Reference, ArgList } from './SchemaDocument';
import { Result, Ok, Err } from './Result';

export type CodecResult<T> = Result<T, CodecError>;

export class Codec<I, O, P, S, Args, Ref extends Codec.Any = Codec.Any> {
    readonly I!: I;
    readonly O!: O;
    readonly P!: P;
    readonly S!: S;
    readonly Args!: Args;
    readonly Ref!: Ref;

    constructor(
        private _name: string,
        private _args: Args,
        private _ref?: Ref,
    ) {}

    static from<I, O, P, S, Args = any>(
        name: string,
        args: Args,
        parse: (
            input: I,
            codec: Codec<I, O, P, S, Args, never>,
        ) => CodecResult<O>,
        serialize: (
            input: P,
            codec: Codec<I, O, P, S, Args, never>,
        ) => CodecResult<S>,
    ) {
        const codec = new Codec<I, O, P, S, Args, never>(name, args);
        codec.parse = input => parse(input, codec);
        codec.serialize = parsed => serialize(parsed, codec);
        return codec;
    }

    get name() {
        return this._name;
    }

    get ref() {
        return this._ref;
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

    pipe<C extends Codec.Any>(codec: C) {
        type _O = Codec.Output<C>;
        type _P = Codec.Parsed<C>;
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
        if (this.ref === undefined) {
            throw new Error('');
        }

        const params: ParamList = [];
        const subst = new Map<Codec.Any, number>();
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
            reference: this.ref.getReference(subst),
        };

        return def;
    }

    getReference(subst?: Map<Codec.Any, number>): Reference {
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
    export type Input<C> = C extends Any ? C['I'] : never;
    export type Output<C> = C extends Any ? C['O'] : never;
    export type Parsed<C> = C extends Any ? C['P'] : never;
    export type Serialized<C> = C extends Any ? C['S'] : never;
    export type Any = Codec<any, any, any, any, any, any>;

    export class Extended<C extends Codec.Any> extends Codec<
        C['I'],
        C['O'],
        C['P'],
        C['S'],
        C['Args'],
        C['Ref']
    > {}
}
