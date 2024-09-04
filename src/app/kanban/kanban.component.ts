import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { WorkItemsService } from '../services/work-items.service';
import { SprintItemService } from '../services/sprint-items.service';
import { WorkItem } from '../models/work-item.model';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit, OnChanges {
  @Input() sprintId: string | null = null;
  workItems: WorkItem[] = [];
  openItems: WorkItem[] = [];
  inProcessItems: WorkItem[] = [];
  doneItems: WorkItem[] = [];

  constructor(
    private workItemsService: WorkItemsService,
    private sprintItemService: SprintItemService
  ) {}

  ngOnInit() {
    if (this.sprintId) {
      this.fetchAllWorkItemsForSprint(this.sprintId);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sprintId'] && !changes['sprintId'].firstChange) {
      this.fetchAllWorkItemsForSprint(changes['sprintId'].currentValue);
    }
  }
  
  fetchAllWorkItemsForSprint(sprintId: string) {
    this.clearItems(); 

    this.sprintItemService.fetchSprintItems(sprintId).subscribe((response) => {
      if (response && Array.isArray(response.SprintItem)) {
        const sprintItemIds = response.SprintItem.map(item => item.Id);

        sprintItemIds.forEach(sprintItemId => {
          this.workItemsService.fetchWorkItems(sprintItemId).subscribe(workItemResponse => {
            if (workItemResponse && Array.isArray(workItemResponse.WorkItem)) {
              const fetchedItems = workItemResponse.WorkItem.map(item => new WorkItem(
                item.Id,
                item.Designation,
                item.PersonInPower,
                item.Priority,
                item.Status || '1',
                item.SeqNr
              ));
              this.workItems = [...this.workItems, ...fetchedItems];
              this.categorizeItems();
            }
          });
        });
      }
    });
  }

  clearItems() {
    this.workItems = [];
    this.openItems = [];
    this.inProcessItems = [];
    this.doneItems = [];
  }

  categorizeItems() {
    this.openItems = this.workItems.filter(item => item.status === '1');
    this.inProcessItems = this.workItems.filter(item => item.status === '2');
    this.doneItems = this.workItems.filter(item => item.status === '3');
  }

  onReorder = (e: any) => {
    const fromArray = e.fromData;
    const toArray = e.toData;
    const movingItem = fromArray[e.fromIndex];

    fromArray.splice(e.fromIndex, 1);
    toArray.splice(e.toIndex, 0, movingItem);

    let newStatus = '1';
    if (toArray === this.inProcessItems) {
      newStatus = '2';
    } else if (toArray === this.doneItems) {
      newStatus = '3';
    }

    movingItem.status = newStatus;

    console.log(`Work item ${movingItem.id} status updated to ${movingItem.status}`);

    this.workItemsService.updateWorkItem(
      movingItem.id,
      movingItem.designation,
      movingItem.status,
      movingItem.priority,
      movingItem.personInPower
    ).subscribe(
      response => {
        console.log(`Work item ${movingItem.id} successfully updated in the database.`);
      },
      error => {
        console.error(`Failed to update work item ${movingItem.id} in the database:`, error);
      }
    );
  }

  onAdd = (e: any) => {
    this.onReorder(e);
  }

  onRemove = (e: any) => {
    const fromArray = e.fromData;
    fromArray.splice(e.fromIndex, 1);
  }
}
