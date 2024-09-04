import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxPopupComponent, DxToastComponent } from 'devextreme-angular';
import { WorkItemsService } from '../services/work-items.service';
import { LookupService } from '../services/lookup.service';
import { WorkItem, WorkItemResponse } from '../models/work-item.model';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-work-items',
  templateUrl: './work-items.component.html',
  styleUrls: ['./work-items.component.css']
})
export class WorkItemsComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) grid!: DxDataGridComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup!: DxPopupComponent;
  @ViewChild(DxToastComponent, { static: false }) toast!: DxToastComponent;

  workItems: WorkItem[] = [];
  currentSprintItemId: string | null = null;

  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  isToastVisible: boolean = false;

  isLoading = false;
  statusOptions: { value: string, text: string }[] = []; 

  priorityOptions = [
    { value: '1', text: 'Low' },
    { value: '2', text: 'Medium-Low' },
    { value: '3', text: 'Medium' },
    { value: '4', text: 'Medium-High' },
    { value: '5', text: 'High' }
  ];

  constructor(
    private workItemsService: WorkItemsService,
    private lookupService: LookupService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.currentSprintItemId = this.sharedService.getCurrentSprintItemId();
    this.loadWorkItemStatus(); 

    if (this.currentSprintItemId) {
      this.loadWorkItems(this.currentSprintItemId);
    }
  }

  loadWorkItemStatus() {
    this.lookupService.getWorkItemStatus().subscribe(statusOptions => {
      this.statusOptions = statusOptions.map(option => ({
        value: option.value,
        text: option.description
      }));
    });
  }

  loadWorkItems(sprintItemId: string) {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    this.workItemsService.fetchWorkItems(sprintItemId).subscribe(
      (response: WorkItemResponse) => {
        this.isLoading = false;
        if (response && Array.isArray(response.WorkItem)) {
          this.workItems = response.WorkItem.map(item => new WorkItem(
            item.Id,
            item.Designation,
            item.PersonInPower,
            item.Priority,
            item.Status,
            item.SeqNr
          ));
          if (this.workItems.length > 0) {
            setTimeout(() => {
              this.grid.instance.selectRows([this.workItems[0].id], true);
            });
          }
        } else {
          console.error('Unexpected response structure:', response);
        }
      },
      error => {
        this.isLoading = false;
        console.error('Failed to load work items:', error);
      }
    );
  }

  getStatusText = (rowData: any) => {
    if (!this.statusOptions || !rowData || !rowData.status) return '';
    const statusOption = this.statusOptions.find(option => option.value === rowData.status);
    return statusOption ? statusOption.text : '';
  };
  getPriorityText = (rowData: any) => {
    if (!this.priorityOptions || !rowData || !rowData.priority) return '';
    const priorityOption = this.priorityOptions.find(option => option.value === rowData.priority);
    return priorityOption ? priorityOption.text : '';
  };

  cancelButtonOptions = {
    text: 'Cancel',
    onClick: () => {
      this.grid.instance.cancelEditData();
    }
  };

  successButtonOptions = {
    text: 'Save',
    type: 'success',
    onClick: () => {
      this.grid.instance.saveEditData();
    }
  };

  onRowInserting(event: any) {
    if (!this.currentSprintItemId) {
      console.error('No sprint item selected');
      return;
    }

    const newData = event.data;

    this.isLoading = true;
    this.workItemsService.addWorkItem(
      newData.designation,
      this.currentSprintItemId,
      newData.status,
      newData.priority,
      newData.personInPower
    ).subscribe(
      response => {
        this.isLoading = false;
        console.log('Work item added:', response);
        this.loadWorkItems(this.currentSprintItemId!);
        this.showToast('Added work-item successfully', 'success');
      },
      error => {
        this.isLoading = false;
        console.error('Error adding work item:', error);
        this.showToast('Failed to add work-item', 'error');
      }
    );
  }

  onRowRemoving(event: any) {
    if (!this.currentSprintItemId) {
      console.error('No sprint item selected');
      return;
    }

    this.isLoading = true;
    this.workItemsService.deleteWorkItem(event.key).subscribe(
      response => {
        this.isLoading = false;
        console.log('Work item deleted:', response);
        this.loadWorkItems(this.currentSprintItemId!);
        this.showToast('Removed work-item successfully', 'success');
      },
      error => {
        this.isLoading = false;
        console.error('Error deleting work item:', error);
        this.showToast('Failed to remove work-item', 'error');
      }
    );
  }

  onRowUpdating(event: any) {
    const updatedData = { ...event.oldData, ...event.newData };

    this.isLoading = true;
    this.workItemsService.updateWorkItem(
      updatedData.id,
      updatedData.designation,
      updatedData.status,
      updatedData.priority,
      updatedData.personInPower
    ).subscribe(
      response => {
        this.isLoading = false;
        console.log('Work item updated:', response);
        this.loadWorkItems(this.currentSprintItemId!);
        this.showToast('Updated work-item successfully', 'success');
      },
      error => {
        this.isLoading = false;
        console.error('Error updating work item:', error);
        this.showToast('Failed to update work-item', 'error');
      }
    );
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.isToastVisible = true;
  }
}
