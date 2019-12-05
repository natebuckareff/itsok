import { Record } from './Record';
import { Number, String } from './Primitive';
import { Array } from './Array';
import { StringBytes } from './Bytes';
import { CodecLike } from './Codec';

const Point = (codec: CodecLike) => Array(codec);

const User = Record({
    id: Number,
    username: String,
    tags: Array(String),
    bin: StringBytes('base64'),
    geo: Point(Number),
});

console.log(JSON.stringify(User.schema(), null, 2));
