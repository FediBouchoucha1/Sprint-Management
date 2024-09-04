import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Sprint } from '../models/sprint.model';
import { QueryService } from './query.service';
import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private apiUrl = 'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/PersistObject';
  private sprintCache: Sprint[] = [];

  constructor(
    private http: HttpClient,
    private queryService: QueryService,
    private persistService: PersistService
  ) {}

  fetchSprintItems(): Observable<Sprint[]> {
    if (this.sprintCache.length > 0) {
      console.log(this.sprintCache);
      return of(this.sprintCache);
    }

    const sprintQuery = this.queryService.createQuery(
      'SprintQuery',
      'Sprint',
      [
        this.queryService.createQueryColumn('Id', 'id'),
        this.queryService.createQueryColumn('Name', 'name'),
        this.queryService.createQueryColumn('StartDate', 'startDate'),
        this.queryService.createQueryColumn('EndDate', 'endDate'),
        this.queryService.createQueryColumn('SeqNr', 'number')
      ]
    );

    const requestBody = this.queryService.buildQueryObject('Json', true, [sprintQuery]);

    return this.http.post<any>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/ReadObjects',
      requestBody
    ).pipe(
      map(response => response.SprintQuery),
      tap(sprints => this.sprintCache = sprints)
    );
  }

  addSprint(name: string, number: string, startDate: Date, endDate: Date): Observable<any> {
    const columns = [
        this.persistService.createPersistColumn('Name', name),
        this.persistService.createPersistColumn('SeqNr', number),
        this.persistService.createPersistColumn('StartDate', startDate),
        this.persistService.createPersistColumn('EndDate', endDate),
    ];

    const persistObject = this.persistService.createPersistObject('Sprint', 0, columns);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);
    
    return this.http.post(this.apiUrl, persistModel).pipe(
      tap(() => this.clearCache())
    );
  }

  updateSprint(id: string, name: string, number: string, startDate: Date, endDate: Date): Observable<any> {
    const columns = [
        this.persistService.createPersistColumn('Name', name),
        this.persistService.createPersistColumn('SeqNr', number),
        this.persistService.createPersistColumn('StartDate', startDate),
        this.persistService.createPersistColumn('EndDate', endDate),
    ];

    const persistObject = this.persistService.createPersistObject('Sprint', 1, columns, id);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);
    
    return this.http.post(this.apiUrl, persistModel).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteSprint(id: string): Observable<any> {
    const persistObject = this.persistService.createPersistObject('Sprint', 3, [], id);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);
    
    return this.http.post(this.apiUrl, persistModel).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache() {
    this.sprintCache = [];
  }

  isCacheEmpty(): boolean {
    return this.sprintCache.length === 0;
  }

  getCachedSprints(): Sprint[] {
    return [...this.sprintCache];
  }
}
