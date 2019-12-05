/**
 * JSON schema for serializing codecs
 */

export interface SchemaDocument {
    type: 'SchemaDocument';
    definitions: CodecDefinition[];
}

export interface CodecDefinition {
    type: 'CodecDefinition';
    name: string;
    definition: CodecReference;
}

export type CodecReference = GenericReference | RecordReference;

export interface GenericReference {
    type: 'CodecReference';
    name: string;
    parameters?: (CodecReference | Literal)[];
}

export interface Literal {
    type: 'Literal';
    codec: string;
    value: any;
}

export interface RecordReference {
    type: 'CodecReference';
    name: 'Record';
    fields: { [field: string]: CodecReference };
}
