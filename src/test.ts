import { CodecLike } from './Codec';
import { Record } from './Record';
import { SchemaBuilder } from './SchemaBuilder';
import { String, Undefined } from './Primitive';
import { Union } from './Union';
import { Number } from './Numeric';
import { inspect } from 'util';

function Option<C extends CodecLike>(codec: C) {
    return Union(codec, Undefined);
}

const User = Record('User', {
    id: String,
    username: String,
    auth: Option(Number),
});

const User2 = Record('User', {
    id: String,
    username: String,
    auth: Option(Number),
});

const schema1 = new SchemaBuilder();
schema1.register(User);

const schema2 = new SchemaBuilder();
schema2.register(User2);

const schema3 = SchemaBuilder.merge(schema1, schema2);
console.log(inspect(schema3.generate(), true, null));

// const x = Number.parse(100).unwrap();
// const y = Number.parse('100').unwrap();
// const z = Number.parse('-100.234e-43').unwrap();
// const w = Integer.parse('1').unwrap();
// const a = Integer.parse(1e10).unwrap();

// console.log(x, y, z, w, a);

// console.log(nutil.inspect(schema.generate(), true, null));

// schema.register('User', User)
// schema.register('Something', Something)
// schema.generate()
