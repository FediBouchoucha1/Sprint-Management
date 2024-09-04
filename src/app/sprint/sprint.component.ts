import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { SprintService } from '../services/sprint.service';
import { SharedService } from '../shared/shared.service';
import { Sprint } from '../models/sprint.model';

@Component({
  selector: 'app-sprint',
  templateUrl: './sprint.component.html',
  styleUrls: ['./sprint.component.css']
})
export class SprintComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) grid!: DxDataGridComponent;

  sprintData: Sprint[] = [];
  sidebarVisible: boolean = false;
  focusedRowKey: string | null = null;
  kanbanVisible: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  isToastVisible: boolean = false;
  isLoading: boolean = false; 

  constructor(
    private sprintService: SprintService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.sharedService.currentSprintId$.subscribe(currentSprintId => {
      if (currentSprintId) {
        this.focusedRowKey = currentSprintId;
        this.sidebarVisible = true;
      }
    });

    this.loadSprintItems();
  }

  loadSprintItems() {
    this.isLoading = true; 

    this.sprintService.fetchSprintItems().subscribe(
      (data: Sprint[]) => {
        console.log(data);
        this.sprintData = data.map((item: Sprint) => ({
          id: item.id,
          name: item.name,
          startDate: item.startDate,
          endDate: item.endDate,
          number: item.number
        }));
        this.initializeGridWithSprintData();
        this.isLoading = false;
      },
      (error) => {
        console.error('Failed to load sprint items:', error);
        this.showToast('Failed to load sprint items', 'error');
        this.isLoading = false; 
      }
    );
  }

  initializeGridWithSprintData() {
    if (this.sprintData.length > 0) {
      setTimeout(() => {
        if (!this.focusedRowKey || !this.sprintData.some(s => s.id === this.focusedRowKey)) {
          this.focusedRowKey = this.sprintData[0].id;
          this.setCurrentSprint(this.sprintData[0]);
        }
        this.grid.instance.selectRows([this.focusedRowKey], true);
        this.sidebarVisible = true;
      });
    }
  }

  setCurrentSprint(sprint: Sprint) {
    this.sharedService.setCurrentSprintId(sprint.id);
    this.sidebarVisible = true;
    this.focusedRowKey = sprint.id;
  }

  onSelectionChanged(event: any) {
    const selectedSprint = event.selectedRowsData[0];
    if (selectedSprint) {
      this.setCurrentSprint(selectedSprint);
    }
  }

  openKanban() {
    this.kanbanVisible = true;
  }

  onRowInserting(event: any) {
    const newData = event.data;
    this.isLoading = true; 

    this.sprintService.addSprint(newData.name, newData.number, newData.startDate, newData.endDate)
      .subscribe(response => {
        console.log('Sprint added:', response);
        this.loadSprintItems();
        this.showToast('Successfully added a new Sprint', 'success');
      }, error => {
        console.error('Error adding sprint:', error);
        this.showToast('Failed to add a new sprint', 'error');
      });
  }

  onRowUpdating(event: any) {
    const updatedData = {
      ...event.oldData,
      ...event.newData
    };

    this.isLoading = true;

    this.sprintService.updateSprint(event.key, updatedData.name, updatedData.number, updatedData.startDate, updatedData.endDate)
      .subscribe(response => {
        console.log('Sprint updated:', response);
        this.loadSprintItems();
        this.showToast('Updated the sprint successfully', 'success');
      }, error => {
        console.error('Error updating sprint:', error);
        this.showToast('Error updating sprint', 'error');
      });
  }

  onRowRemoving(event: any) {
    this.isLoading = true; 
    this.sprintService.deleteSprint(event.key)
      .subscribe(response => {
        console.log('Sprint deleted:', response);
        this.loadSprintItems(); 
        this.showToast('Removed the sprint successfully', 'success');
      }, error => {
        console.error('Error deleting sprint:', error);
        this.showToast('Error deleting sprint', 'error');
      });
  }

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

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.isToastVisible = true;
  }
}
