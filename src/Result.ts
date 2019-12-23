export class Result<T, E> {
    constructor(
        public readonly success: T,
        public readonly error: E,
        public readonly isError: boolean,
    ) {}

    pipe<PT, PE extends Error>(
        onSuccess: (success: T) => Result<PT, PE>,
    ): Result<PT, PE> {
        if (this.isError) {
            return this as Result<any, any>;
        } else {
            return onSuccess(this.success);
        }
    }

    ok(): Result<T, any> {
        return this;
    }

    err(): Result<any, E> {
        return this;
    }

    unwrap() {
        if (this.isError) {
            throw this.error;
        }
        return this.success;
    }

    static join<T, E>(results: Result<T, E>[]): Result<T[], E> {
        const j = [];
        for (const r of results) {
            if (r.isError) {
                return r.err();
            }
            j.push(r.success);
        }
        return Ok(j);
    }
}

export function Ok<T>(success: T): Result<T, any> {
    return new Result(success, null, false);
}

function Err(message: string): Result<any, Error>;
function Err<E extends Error>(error: E): Result<any, E>;
function Err(x: any) {
    return new Result(null, typeof x === 'string' ? new Error(x) : x, true);
}
export { Err };

export function Try<T, E>(cb: () => T): Result<T, E> {
    try {
        return Ok(cb());
    } catch (error) {
        return Err(error);
    }
}
