import { Codec } from './Codec';
import { CodecError } from './CodecError';

export class UnexpectedTypeError extends CodecError {
    constructor(codec: Codec.Any, expected: string, actual: any) {
        super(codec, `Expected type ${expected}, got ${typeof actual}`);
        this.name = 'CodecUnexpectedTypeError';
    }
}

export class ParsingError extends CodecError {
    constructor(codec: Codec.Any, cause: Error) {
        super(codec, 'Parsing failed', cause);
    }
}

export class SerializationError extends CodecError {
    constructor(codec: Codec.Any, cause: Error) {
        super(codec, 'Serialization failed', cause);
    }
}
