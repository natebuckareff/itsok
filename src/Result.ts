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

    unwrap() {
        if (this.isError) {
            throw this.error;
        }
        return this.success;
    }
}

export function Ok<T>(success: T): Result<T, any> {
    return new Result(success, null, false);
}

export function Err<T>(error: T): Result<any, T> {
    return new Result(null, error, true);
}

export function Try<TSuccess, TError>(
    cb: () => TSuccess,
): Result<TSuccess, TError> {
    try {
        return Ok(cb());
    } catch (error) {
        return Err(error);
    }
}
