import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, finalize } from 'rxjs/operators';
import { QueryService } from './query.service';
import { SprintTeamMemberResponse, PotentialTeamMember, TeamMember } from '../models/team-member.model';
import { PersistService } from './persist.service';


@Injectable({
  providedIn: 'root'
})
export class TeamMembersService {
  private teamMembersCache: { [sprintId: string]: SprintTeamMemberResponse } = {};
  private potentialTeamMembersCache: PotentialTeamMember[] | null = null;

  constructor(
    private http: HttpClient, 
    private queryService: QueryService,
    private persistService: PersistService
  ) {}

  fetchTeamMembers(sprintId: string): Observable<SprintTeamMemberResponse> {
    if (this.teamMembersCache[sprintId]) {
      console.log("Team members cache");
      return of(this.teamMembersCache[sprintId]);
    }

    const teamMemberQuery = this.queryService.createQuery(
      'SprintTeamMember',
      'SprintTeamMember',
      [
        this.queryService.createQueryColumn('Id', 'PersonId'),
        this.queryService.createQueryColumn('Person.EMail', 'PersonEMail'),
        this.queryService.createQueryColumn('Person.MobilePhone', 'PersonMobilePhone'),
        this.queryService.createQueryColumn('Person.FirstName', 'PersonFirstName'),
        this.queryService.createQueryColumn('Person.LastName', 'PersonLastName')
      ],
      `Sprint.Id = '${sprintId}'`
    );

    const requestBody = this.queryService.buildQueryObject('Json', true, [teamMemberQuery]);


    return this.http.post<SprintTeamMemberResponse>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/ReadObjects',
      requestBody
    ).pipe(
      tap(response => this.teamMembersCache[sprintId] = response)
    );
  }

  fetchPotentialTeamMembers(): Observable<PotentialTeamMember[]> {
    if (this.potentialTeamMembersCache) {
      console.log("potential team members cache");
      return of(this.potentialTeamMembersCache);
    }

    const potentialTeamMemberQuery = this.queryService.createQuery(
      'Person',
      'Person',
      [
        this.queryService.createQueryColumn('Id', 'Id'),
        this.queryService.createQueryColumn('EMail', 'EMail'),
        this.queryService.createQueryColumn('FirstName', 'FirstName'),
        this.queryService.createQueryColumn('LastName', 'LastName'),
        this.queryService.createQueryColumn('Active', 'Active'),
        this.queryService.createQueryColumn('Status', 'Status'),
        this.queryService.createQueryColumn('MobilePhone', 'MobilePhone'),
        this.queryService.createQueryColumn('Shorthand', 'Shorthand')
      ]
    );

    const requestBody = this.queryService.buildQueryObject('Json', true, [potentialTeamMemberQuery]);


    return this.http.post<any>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/ReadObjects',
      requestBody
    ).pipe(
      map(response => {
        if (response && response.Person) {
          const members = response.Person.map((member: any) => new PotentialTeamMember(
            member.Id,
            member.FirstName,
            member.LastName,
            member.EMail,
            member.MobilePhone
          ));
          this.potentialTeamMembersCache = members;
          return members;
        } else {
          console.error('Unexpected API response format:', response);
          return [];
        }
      }) 
    );
  }

  clearTeamMembersCache(sprintId: string) {
    delete this.teamMembersCache[sprintId];
  }

  clearPotentialTeamMembersCache() {
    this.potentialTeamMembersCache = null;
  }

  persistTeamMembers(sprintId: string, memberIds: string[]): Observable<any> {
    const persistObjects = memberIds.map(id => {
      const columns = [
        this.persistService.createPersistColumn('ParentId', sprintId),
        this.persistService.createPersistColumn('IdRefPerson', id)
      ];
      return this.persistService.createPersistObject('SprintTeamMember', 0, columns);
    });
  
    const requestBody = this.persistService.buildCustomPersistObjectModel(0, persistObjects); 
  

    return this.http.post<any>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/PersistObjects',
      requestBody
    ).pipe(
      tap(response => {
        console.log('Persist response:', response);
      })
    );
  }

  updateTeamMember(id: string, updatedData: Partial<TeamMember>): Observable<any> {
    const columns = [
      this.persistService.createPersistColumn('Person.EMail', updatedData.email || ''),
      this.persistService.createPersistColumn('Person.MobilePhone', updatedData.phone || ''),
      this.persistService.createPersistColumn('Person.FirstName', updatedData.firstName || ''),
      this.persistService.createPersistColumn('Person.LastName', updatedData.lastName || '')
    ];

    const persistObject = this.persistService.createPersistObject('SprintTeamMember', 1, columns, id);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);


    return this.http.post<any>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/PersistObject',
      persistModel
    ).pipe(
      tap(response => {
        console.log('Update response:', response);
      })
    );
  }

  deleteMember(id: string): Observable<any> {
    const persistObject = this.persistService.createPersistObject('SprintTeamMember', 3, [], id);
    const persistModel = this.persistService.buildPersistObjectModel(0, persistObject);
    

    return this.http.post<any>(
      'https://enterprise.barthauer.cloud/KAOS_stage/api/ObjectSpaces/PersistObject',
      persistModel
    ).pipe(
      tap(response => {
        console.log('Delete response:', response);
      })
    );
  }
}
