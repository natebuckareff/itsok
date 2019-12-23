import { CodecError } from './Codec';
import { Ok, Err, Try } from './Result';
import { PrimitiveCodec, CodecUnexpectedTypeError } from './Primitive';
import { Regex } from './Regex';

const _Number = new PrimitiveCodec<unknown, number>('Number', i => {
    if (typeof i === 'number') {
        return Ok(i);
    } else if (typeof i === 'string') {
        return Regex.Float.parse(i).pipe(s => Try(() => Number.parseFloat(s)));
    } else {
        return Err(new CodecUnexpectedTypeError('Number', i));
    }
});
export { _Number as Number };

// XXX TODO should use something like newtype-ts
export type IntegerType = number & { readonly __tag: unique symbol };

// XXX TODO serializing should not result in an unknown; instead we should add
// an additional type paramter to Codec so that the output of `serialize` does
// not have to equal the input of `parse`
export const Integer = new PrimitiveCodec<unknown, IntegerType>('Integer', i =>
    Try(() => {
        let n: number;

        if (typeof i === 'number') {
            n = i;
        } else if (typeof i === 'string') {
            n = Number.parseInt(Regex.Integer.parse(i).unwrap());
        } else {
            throw new CodecUnexpectedTypeError('Integer', i);
        }

        if (!Number.isSafeInteger(n)) {
            throw new CodecError('Expected *safe* integer');
        }

        return n as IntegerType;
    }),
);
