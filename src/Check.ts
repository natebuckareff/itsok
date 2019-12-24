import { Codec, CodecError } from './Codec';
import { Ok, Err } from './Result';

function Check<T>(check: (x: T) => boolean): Codec<T, T>;
function Check<T>(name: string, check: (x: T) => boolean): Codec<T, T>;
function Check<T>(x: any, y?: any) {
    let name: string;
    let message: string;
    let check: (x: T) => boolean;

    if (typeof x === 'string') {
        name = `Check(${x})`;
        message = `Check failed: ${x}`;
        check = y;
    } else {
        name = 'Check';
        message = `Check failed`;
        check = x;
    }

    return new Codec<T, T>(
        name,
        i => (check(i) ? Ok(i) : Err(new CodecError(message))),
        Ok,
    );
}
export { Check };
