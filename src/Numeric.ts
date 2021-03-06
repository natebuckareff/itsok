import { CodecError } from './CodecError';
import { Ok, Err, Try } from './Result';
import { Primitive } from './Primitive';
import { Regex } from './Regex';
import { UnexpectedTypeError, ParsingError } from './Errors';

const _Number = Primitive<number>('Number', function(i) {
    if (typeof i === 'number') {
        return Ok(i);
    } else if (typeof i === 'string') {
        return Regex.Float.parse(i).pipe(s => Try(() => Number.parseFloat(s)));
    } else {
        return Err(new UnexpectedTypeError(this, 'Number', i));
    }
});
export { _Number as Number };

// XXX TODO should use something like newtype-ts
export type IntegerType = number & { readonly __tag: unique symbol };

export const Integer = Primitive<IntegerType>('Integer', function(i) {
    return Try(() => {
        let n: number;

        if (typeof i === 'number') {
            n = i;
        } else if (typeof i === 'string') {
            n = Number.parseInt(Regex.Integer.parse(i).unwrap());
        } else {
            throw new UnexpectedTypeError(this, 'integer', i);
        }

        if (!Number.isSafeInteger(n)) {
            throw new CodecError(this, 'Expected *safe* integer');
        }

        return n as IntegerType;
    });
});

// XXX TODO should use something like newtype-ts
export type BigIntegerType = string & { readonly __tag: unique symbol };

export const BigInteger = Primitive<BigIntegerType>('BigInteger', function(i) {
    const r = Regex.Integer.parse(i).pipe(x => Ok(x as BigIntegerType));
    if (r.isError) {
        return Err(new ParsingError(this, r.error));
    }
    return r;
});
