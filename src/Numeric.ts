import { PrimitiveCodec, Number as Num } from './Primitive';
import { Ok, Err } from './Result';

// XXX TODO should use something like newtype-ts
export type IntegerType = number & { readonly __tag: unique symbol };

// XXX TODO serializing should not result in an unknown; instead we should add
// an additional type paramter to Codec so that the output of `serialize` does
// not have to equal the input of `parse`
const _Integer = new PrimitiveCodec<unknown, IntegerType>(
    'Integer',
    i => {
        return Num.parse(i).pipe(x =>
            Number.isSafeInteger(x)
                ? Ok(x)
                : Err(new Error('Expected safe integer')),
        );
    },
    Ok,
);
export { _Integer as Integer };
