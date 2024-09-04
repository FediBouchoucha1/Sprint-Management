import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface LookupItem {
  value: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private workItemStatusCache: LookupItem[] = [];
  private kindOptionsCache: LookupItem[] = [];


  constructor(private http: HttpClient) {}

  getWorkItemStatus(): Observable<LookupItem[]> {
    if (this.workItemStatusCache.length > 0) {
      return of(this.workItemStatusCache);
    }
    return this.http.post<any>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/ReadPicklistItems',
      { Name: 'WorkItem_Status' }
    ).pipe(
      map(response => {
        if (response && response.Data) {
          this.workItemStatusCache = response.Data.map((item: any) => ({
            value: item.Value,
            description: item.Description
          }));
          return this.workItemStatusCache;
        } else {
          throw new Error('Unexpected response structure');
        }
      }),
      catchError(error => {
        console.error('Failed to fetch WorkItem_Status:', error);
        return of([]);  
      })
    );
  }

  getKindOptions(): Observable<LookupItem[]> {
    if (this.kindOptionsCache.length > 0) {
      return of(this.kindOptionsCache);
    }
    return this.http.post<any>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/ReadPicklistItems',
      { Name: 'APM_ProductRequirementKind' }
    ).pipe(
      map(response => {
        if (response && response.Data) {
          this.kindOptionsCache = response.Data.map((item: any) => ({
            value: item.Value,
            description: item.Description
          }));
          return this.kindOptionsCache;
        } else {
          throw new Error('Unexpected response structure');
        }
      }),
      catchError(error => {
        console.error('Failed to fetch APM_ProductRequirementKind:', error);
        return of([]);
      })
    );
  }
}
