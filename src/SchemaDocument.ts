export interface SchemaDocument {
    type: 'SchemaDocument';
    definitions: Definition[];
}

export interface Definition {
    type: 'Definition';
    name: string;
    params?: ParamList;
    reference: Reference;
}

export type ParamList = ('Literal' | 'Reference')[];

export interface Reference {
    type: 'Reference';
    name: string;
    args?: ArgList;
}

export type ArgList = Arg[] | { [arg: string]: Arg };
export type Arg = Literal | Reference | Param;
export type Param = { type: 'Param'; param: number };

export interface Literal {
    type: 'Literal';
    kind: string;
    value: any;
    const?: boolean;
}
