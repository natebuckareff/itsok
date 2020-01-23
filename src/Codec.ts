import { CodecError } from './CodecError';
import { Definition, ParamList, Reference, ArgList } from './SchemaDocument';
import { Result, Ok, Err } from './Result';

export type CodecResult<T> = Result<T, CodecError>;

export type ParseFn<I, O, P, S, Args = any, Ref extends Codec.Any = any> = (
    this: Codec<I, O, P, S, Args, Ref>,
    input: I,
) => CodecResult<O>;

export type SerializeFn<I, O, P, S, Args = any, Ref extends Codec.Any = any> = (
    this: Codec<I, O, P, S, Args, Ref>,
    input: P,
) => CodecResult<S>;

export class Codec<I, O, P, S, Args = any, Ref extends Codec.Any = any> {
    readonly I!: I;
    readonly O!: O;
    readonly P!: P;
    readonly S!: S;
    readonly Args!: Args;
    readonly Ref!: Ref;

    public parse: ParseFn<I, O, P, S, Args, Ref>;
    public serialize: SerializeFn<I, O, P, S, Args, Ref>;

    constructor(
        private _name: string,
        private _args: Args,
        parse: ParseFn<I, O, P, S, Args, Ref>,
        serialize: SerializeFn<I, O, P, S, Args, Ref>,
        private _ref?: Ref,
    ) {
        this.parse = parse.bind(this);
        this.serialize = serialize.bind(this);
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

    visitArgs(visitor: (x: any, k?: number | string) => void) {
        if (Array.isArray(this.args)) {
            for (let i = 0; i < this.args.length; ++i) {
                visitor(this.args[i], i);
            }
        } else if (this.args !== undefined) {
            visitor(this.args);
        }
    }

    pipe<C extends Codec.Any>(codec: C) {
        type _O = Codec.Output<C>;
        type _P = Codec.Parsed<C>;
        return new Codec<I, _O, _P, S>(
            '_pipe',
            [this, codec],
            i => this.parse(i).pipe(codec.parse),
            p => codec.serialize(p).pipe(this.serialize),
        );
    }

    check(cond: (o: O) => boolean) {
        return new Codec<I, O, P, S, Args>(
            '_check',
            this.args,
            i => {
                return this.parse(i).pipe(x =>
                    cond(x) ? Ok(x) : Err(new CodecError(this, 'Check failed')),
                );
            },
            this.serialize,
        );
    }

    getDependencies(): Codec.Any[] {
        const deps: Codec.Any[] = [];

        // Due to substitution a codec with a ref will push its args down to the ref. A
        // codec without a ref is a builtin and therefore its args are its dependencies
        if (this.ref) {
            deps.push(this.ref);
            deps.push(...this.ref.getDependencies());
        } else {
            this.visitArgs(x => {
                if (x instanceof Codec) {
                    deps.push(x);
                    deps.push(...x.getDependencies());
                }
            });
        }
        return deps;
    }

    hasDefinition(): boolean {
        return this.ref !== undefined;
    }

    getDefinition(): Definition {
        if (!this.hasDefinition()) {
            throw new Error('Builtin codes do not have definitions');
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

            // `this.ref!` because `!this.hasDefinition()` guarantees that `this.ref` is
            // defined
            reference: this.ref!.getReference(subst),
        };

        if (params.length === 0) {
            delete def.params;
        }

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
