import { Codec } from './Codec';

export class CodecError extends Error {
    constructor(
        public readonly codec: Codec.Any,
        message: string,
        public readonly cause?: Error,
    ) {
        super(`${codec.name}: ${message}`);
    }

    fullMessage() {
        const messages: string[] = [];
        let error: Error | undefined = this;
        while (error) {
            messages.push(error.message);
            if (error instanceof CodecError) {
                error = error.cause;
            } else {
                break;
            }
        }
        return messages.map((x, i) => `${' '.repeat(i * 2)}${x}`).join('\n');
    }
}
