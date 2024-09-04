import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QueryService } from './query.service';
import { PersistService } from './persist.service';  
import { SprintItemResponse } from '../models/sprint-item.model';

@Injectable({
  providedIn: 'root'
})
export class SprintItemService {

  private apiUrl = 'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/PersistObject';
  private sprintItemsCache: { [sprintId: string]: SprintItemResponse } = {};

  constructor(
    private http: HttpClient,
    private queryService: QueryService,
    private persistService: PersistService  
  ) {}

  fetchSprintItems(sprintId: string): Observable<SprintItemResponse> {
    if (this.sprintItemsCache[sprintId]) {
      console.log("Sprint-items cache");
      return of(this.sprintItemsCache[sprintId]);
    }

    const sprintItemQuery = this.queryService.createQuery(
      'SprintItem',
      'SprintItem',
      [
        this.queryService.createQueryColumn('Id', 'Id'),
        this.queryService.createQueryColumn('Kind', 'Kind'),
        this.queryService.createQueryColumn('Sprint.Name', 'SprintName'),
        this.queryService.createQueryColumn('ProductRequirement.Name', 'ProductRequirementName')
      ],
      `Sprint.Id = '${sprintId}'`
    );

    const requestBody = this.queryService.buildQueryObject('Json', true, [sprintItemQuery]);

    return this.http.post<SprintItemResponse>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/ReadObjects',
      requestBody
    ).pipe(
      tap(response => this.sprintItemsCache[sprintId] = response)
    );
  }

  addSprintItem(kind: string, parentId: string): Observable<any> {
    const columns = [
      this.persistService.createPersistColumn('Kind', kind),
      this.persistService.createPersistColumn('ParentId', parentId),
      this.persistService.createPersistColumn('IdRefProductRequirement', '7FB58091-68EF-4172-A609-38F17BCEB34D'),
    ];

    const persistObject = this.persistService.createPersistObject('SprintItem', 0, columns);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);

    return this.http.post(this.apiUrl, persistModel).pipe(
      tap(() => this.clearSprintItemsCache(parentId)
    ));
  }

  deleteSprintItem(sprintItemId: string, sprintId: string): Observable<any> {
    const persistObject = this.persistService.createPersistObject('SprintItem', 3, [], sprintItemId);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);

    return this.http.post(this.apiUrl, persistModel).pipe(
      tap(() => {
        this.clearSprintItemsCache(sprintId);
      })
    );
  }

  updateSprintItem(id: string, kind: string,sprintId: string): Observable<any> {
    const columns = [
      this.persistService.createPersistColumn('Kind', kind)
    ];

    const persistObject = this.persistService.createPersistObject('SprintItem', 1, columns, id);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);

    return this.http.post(this.apiUrl, persistModel).pipe(
      tap(() => this.clearSprintItemsCache(sprintId))
    );
  }
  
  clearSprintItemsCache(sprintId: string) {
    delete this.sprintItemsCache[sprintId];
  }
}
