export class QueryColumn {
  OPath: string;
  Name: string;
  SortOrder?: QueryColumnSortOrder;
  IsFilter?: boolean;
  IsHidden?: boolean;
  IsInvariant?: boolean;
  Format?: string;
  key?: number;

  constructor(
    OPath: string,
    Name: string,
    SortOrder?: QueryColumnSortOrder,
    IsFilter?: boolean,
    IsHidden?: boolean,
    IsInvariant?: boolean,
    Format?: string,
    key?: number
  ) {
    this.OPath = OPath;
    this.Name = Name;
    this.SortOrder = SortOrder;
    this.IsFilter = IsFilter;
    this.IsHidden = IsHidden;
    this.IsInvariant = IsInvariant;
    this.Format = Format;
    this.key = key;
  }
}

export class Query {
  Name: string;
  ObjectType: string;
  Columns: QueryColumn[];
  OPath?: string;

  constructor(
    Name: string,
    ObjectType: string,
    Columns: QueryColumn[],
    OPath?: string
  ) {
    this.Name = Name;
    this.ObjectType = ObjectType;
    this.Columns = Columns;
    this.OPath = OPath;
  }
}

export enum QueryColumnSortOrder {
  None = 'NONE',
  Ascending = 'Ascending',
  Descending = 'Descending',
}

export class QueryObjectsModel {
  OutputMode: string;
  Indent: boolean;
  ObjectQueries: Query[];

  constructor(OutputMode: string, Indent: boolean, ObjectQueries: Query[]) {
    this.OutputMode = OutputMode;
    this.Indent = Indent;
    this.ObjectQueries = ObjectQueries;
  }
}