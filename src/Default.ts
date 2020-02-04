import { Codec } from './Codec';

export function Default<C extends Codec.Any>(codec: C, factory: () => C['P']) {
    type I = C['I'];
    type O = C['O'];
    type P = C['P'];
    type S = C['S'];
    return new Codec<I, O, P | undefined, S>(
        'Default',
        undefined,
        codec.parse,
        o => codec.serialize(o === undefined ? factory() : o),
    );
}
