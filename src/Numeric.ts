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

// XXX TODO should use something like newtype-ts
export type BigIntegerType = string & { readonly __tag: unique symbol };

export const BigInteger = new PrimitiveCodec<unknown, BigIntegerType>(
    'BigInteger',
    i =>
        typeof i === 'string'
            ? Regex.Integer.parse(i).pipe(x => Ok(x as BigIntegerType))
            : Err(new CodecError('Expected string')),
);
