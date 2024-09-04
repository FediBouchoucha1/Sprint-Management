import { Injectable } from '@angular/core';
import { Query, QueryColumn, QueryColumnSortOrder, QueryObjectsModel } from '../models/query.model';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
 
 
  createQuery(name: string, objectType: string, columns: QueryColumn[], oPath?: string): Query {
    return new Query(name, objectType, columns, oPath);
  }

  createQueryColumn(
    oPath: string,
    name: string,
    sortOrder?: QueryColumnSortOrder,
    isFilter?: boolean,
    isHidden?: boolean,
    isInvariant?: boolean,
    format?: string,
    key?: number
  ): QueryColumn {
    return new QueryColumn(oPath, name, sortOrder, isFilter, isHidden, isInvariant, format, key);
  }

  buildQueryObject(outputMode: string = 'Json', indent: boolean = true, queries: Query[] = []): QueryObjectsModel {
    return new QueryObjectsModel(outputMode, indent, queries);
  }
}
