import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QueryService } from './query.service';
import { PersistService } from './persist.service';   
import { WorkItemResponse } from '../models/work-item.model';

@Injectable({
  providedIn: 'root'
})
export class WorkItemsService {
  constructor(private http: HttpClient, private queryService: QueryService,private persistService: PersistService) {}

  fetchWorkItems(sprintItemId: string): Observable<WorkItemResponse> {
    const workItemQuery = this.queryService.createQuery(
      'WorkItem',
      'WorkItem',
      [
        this.queryService.createQueryColumn('Designation', 'Designation'),
        this.queryService.createQueryColumn('Id', 'Id'),
        this.queryService.createQueryColumn('Status', 'Status'),
        this.queryService.createQueryColumn('Urgency', 'Priority'),
        this.queryService.createQueryColumn('concat(Person.LastName, \',\' , Person.FirstName)', 'PersonInPower'),
        this.queryService.createQueryColumn('SeqNr', 'SeqNr'),
      ],
      `SprintItem.Id = '${sprintItemId}'`
    );

    const requestBody = this.queryService.buildQueryObject('Json', true, [workItemQuery]);

    return this.http.post<WorkItemResponse>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/ReadObjects',
      requestBody
    );
  }
  addWorkItem(designation: string, parentId: string, status: string, urgency: string, personInPower: string): Observable<any> {
    const columns = [
      this.persistService.createPersistColumn('Designation', designation),
      this.persistService.createPersistColumn('ParentId', parentId),
      this.persistService.createPersistColumn('Status', status),
      this.persistService.createPersistColumn('Urgency', urgency),
      this.persistService.createPersistColumn('concat(Person.LastName, \',\' , Person.FirstName)', personInPower),
      this.persistService.createPersistColumn('SeqNr', '')
    ];

    const persistObject = this.persistService.createPersistObject('WorkItem', 0, columns);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);

    return this.http.post('https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/PersistObject', persistModel);
  }

  deleteWorkItem(id: string): Observable<any> {
    const persistObject = this.persistService.createPersistObject('WorkItem', 3, [], id);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);
    
    return this.http.post('https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/PersistObject', persistModel);
  }

  updateWorkItem(
    id: string,
    designation: string,
    status: string,
    urgency: string,
    personInPower: string
  ): Observable<any> {
    const columns = [
      this.persistService.createPersistColumn('Designation', designation),
      this.persistService.createPersistColumn('Status', status),
      this.persistService.createPersistColumn('Urgency', urgency),
      this.persistService.createPersistColumn('concat(Person.LastName, \',\' , Person.FirstName)', personInPower)
    ];

    const persistObject = this.persistService.createPersistObject('WorkItem', 1, columns, id);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);

    return this.http.post('https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/PersistObject', persistModel);
  }
}
