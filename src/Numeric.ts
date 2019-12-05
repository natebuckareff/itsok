import * as ok from './index';

// XXX TODO should use something like newtype-ts
export type IntegerType = number & { readonly __tag: unique symbol };

// XXX TODO serializing should not result in an unknown; instead we should add
// an additional type paramter to Codec so that the output of `serialize` does
// not have to equal the input of `parse`
const _Integer = new ok.PrimitiveCodec<unknown, IntegerType>(
    'Integer',
    i => {
        return ok.Number.parse(i).pipe(x =>
            Number.isSafeInteger(x)
                ? ok.Ok(x)
                : ok.Err(new Error('Expected safe integer')),
        );
    },
    ok.Ok,
);
export { _Integer as Integer };
