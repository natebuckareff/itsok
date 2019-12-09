import { Array } from './Array';
import { Buffer } from './Bytes';
import { CodecLike } from './Codec';
import { Number, String } from './Primitive';
import { Record } from './Record';

const Point = (codec: CodecLike) => Array(codec);

const User = Record({
    id: String,
    username: String,
    tags: Array(String),
    bin: Buffer('base64'),
    geo: Point(Number),
});

console.log(JSON.stringify(User.schema(), null, 2));
