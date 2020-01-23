import { codegen } from './codegen';

// import { codegenSchema } from './codegen';

// function _Response<C extends Codec.Any, E extends Codec.Any>(
//     dataCodec: C,
//     errorCodec: E,
// ) {
//     const Resp = Record({
//         data: Union(Undefined, dataCodec),
//         error: Union(Undefined, errorCodec),
//     });
//     type I = typeof Resp['I'];
//     type O = C['O'];
//     type P = C['O'] | E['O'];
//     type S = typeof Resp['S'];
//     return new Codec<I, O, P, S, [C]>(
//         'Response',
//         [dataCodec],
//         i => {
//             return Resp.parse(i).pipe(x => {
//                 if (x.error !== undefined) {
//                     return Err(new Error(x.error.message));
//                 }
//                 return Ok(x.data as O);
//             });
//         },
//         o => {
//             if ((o as any) instanceof Error) {
//                 return errorCodec
//                     .serialize(o)
//                     .pipe(error => Ok({ data: undefined, error }));
//             } else {
//                 return dataCodec
//                     .serialize(o)
//                     .pipe(data => Ok({ data, error: undefined }));
//             }
//         },
//     );
// }

// const builder = new SchemaBuilder();

/*
I       unknown
O       data
P       data | error
S       { data } | { error }
*/

// const ErrorCodec = Codec.from('ErrorCodec', [],
//     i => {
//         if (!i instanceof Error)) {
//             return Err(new CodecError('Expected instance of Error'))
//         }
//         return Ok(i)
//     },
//     Ok);

////////////////////////////////////////////////////////////////

// const ErrorObject = Alias(
//     'ErrorObject',
//     Record({
//         message: String,
//     }),
// );

// namespace ErrorObject {
//     export type T = typeof ErrorObject;
// }

// const ErrorInstance = new Codec<
//     ErrorObject.T['O'],
//     Error,
//     Error,
//     ErrorObject.T['O']
// >(
//     'ErrorInstance',
//     [],
//     function(i) {
//         return Ok(new Error(i.message));
//     },
//     o => Ok({ message: o.message }),
// );

// const ErrorCodec = ErrorObject.pipe(ErrorInstance);

// const x = ErrorCodec.parse({ message: 'hello' }).unwrap();
// const y = ErrorCodec.serialize(new Error('woops')).unwrap();

// // console.log(x);
// console.log(y);

// const User = Alias(
//     'User',
//     [Integer],
//     Record({
//         id: BigInteger,
//         username: String,
//         data: Integer,
//     }),
// );

// console.log('#', String.hasDefinition());

const text = codegen.schema({
    type: 'SchemaDocument',
    definitions: [
        {
            type: 'Definition',
            name: 'Username',
            reference: {
                type: 'Reference',
                name: 'String',
            },
        },
        {
            type: 'Definition',
            name: 'Option',
            params: ['Reference'],
            reference: {
                type: 'Reference',
                name: 'Union',
                args: [
                    { type: 'Param', param: 0 },
                    { type: 'Reference', name: 'Undefined' },
                ],
            },
        },
    ],
});
console.log(text);

// const condensed = codegen.condense(items);
// codegen.unwrap(condensed);

// const text = codegen.compile(condensed);
// console.log(text);

// console.log(inspect(condensed, true, null));

////////////////////////////////////////////////////////////////

// Need a way to denote that a group of items should never break

// 1) collect all the items in a block and concat into a single token or
// 2)

// const builder = new SchemaBuilder();
// builder.register(User);
// const schema = builder.generate();
// console.log(codegenSchema(schema));
