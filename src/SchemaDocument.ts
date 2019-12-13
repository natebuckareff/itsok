/**
 * JSON schema for serializing codecs
 */

export interface SchemaDocument {
    type: 'SchemaDocument';
    definitions: Definition[];
}

export type Definition = CodecDefinition;

export interface CodecDefinition {
    type: 'CodecDefinition';
    name: string;
    reference: Reference;
}

export type Reference = CodecReference | FactoryReference;

export interface CodecReference {
    type: 'CodecReference';
    name: string;
}

export type FactoryReference = GenericFactoryReference | RecordFactoryReference;

export interface GenericFactoryReference {
    type: 'GenericFactoryReference';
    name: string;
    args: Literal[];
}

export interface RecordFactoryReference {
    type: 'RecordFactoryReference';
    fields: { [field: string]: Reference };
}

export interface Literal {
    type: 'Literal';
    codec: string;
    value: any;
}
