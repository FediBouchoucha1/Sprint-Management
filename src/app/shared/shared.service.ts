
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private currentSprintIdSource = new BehaviorSubject<string | null>(null);
  currentSprintId$ = this.currentSprintIdSource.asObservable();

  private currentSprintItemIdSource = new BehaviorSubject<string | null>(null);  
  currentSprintItemId$ = this.currentSprintItemIdSource.asObservable();  

  setCurrentSprintId(sprintId: string) {
    this.currentSprintIdSource.next(sprintId);
  }

  getCurrentSprintId(): string | null {
    return this.currentSprintIdSource.getValue();
  }

  clearCurrentSprintId() {
    this.currentSprintIdSource.next(null);
  }


  setCurrentSprintItemId(sprintItemId: string) {
    this.currentSprintItemIdSource.next(sprintItemId); 
  }

  getCurrentSprintItemId(): string | null {
    return this.currentSprintItemIdSource.getValue();
  }

  clearCurrentSprintItemId() {
    this.currentSprintItemIdSource.next(null);  
  }
}
