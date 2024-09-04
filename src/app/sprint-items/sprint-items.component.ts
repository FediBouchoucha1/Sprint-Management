import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { SprintItemService } from '../services/sprint-items.service';
import { SprintItem, SprintItemResponse } from '../models/sprint-item.model';
import { SharedService } from '../shared/shared.service';
import { LookupService } from '../services/lookup.service';
import { EditingStartEvent, InitNewRowEvent } from 'devextreme/ui/data_grid';

@Component({
  selector: 'app-sprint-items',
  templateUrl: './sprint-items.component.html',
  styleUrls: ['./sprint-items.component.css']
})
export class SprintItemsComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) grid!: DxDataGridComponent;

  sprintItems: SprintItem[] = [];
  currentSprintId: string | null = null;
  currentSprintItem: SprintItem |null = null;
  focusedRowKey: string | null = null;

  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  isToastVisible: boolean = false;
  isLoading: boolean = false;

  requirementEditorOptions = { value: 'Étude du projet', readOnly: true};
  sprintEditorOptions = { value: '04-30-2024', readOnly: true};

  kindOptions: { value: string, text: string }[] = []; 

  constructor(private sprintItemService: SprintItemService, private sharedService: SharedService,private lookupService: LookupService,) {}

  ngOnInit() {
    this.sharedService.currentSprintId$.subscribe(sprintId => {
      this.currentSprintId = sprintId;
      if (this.currentSprintId) {
        this.loadSprintItems(this.currentSprintId);
      }
    });

    this.sharedService.currentSprintItemId$.subscribe(sprintItemId => {
      this.focusedRowKey = sprintItemId;
    });

    this.loadkinds(); 
  }

  loadkinds() {
    this.lookupService.getKindOptions().subscribe(KindOptions => {
      this.kindOptions = KindOptions.map(option => ({
        value: option.value,
        text: option.description
      }));
    });
  }
  
  loadSprintItems(sprintId: string) {
    this.isLoading = true;
    this.sprintItemService.fetchSprintItems(sprintId).subscribe(
      (response: SprintItemResponse) => {
        this.isLoading = false;
        if (response && Array.isArray(response.SprintItem)) {
          this.sprintItems = response.SprintItem.map(item => new SprintItem(
            item.Id,
            item.Kind,
            item.SprintName,
            item.ProductRequirementName
          ));
          if (this.sprintItems.length > 0) {
            setTimeout(() => {
              if (!this.focusedRowKey || !this.sprintItems.some(s => s.id === this.focusedRowKey)) {
                this.focusedRowKey = this.sprintItems[0].id;
                this.setCurrentSprintItem(this.sprintItems[0]);
              }
              this.grid.instance.selectRows([this.focusedRowKey], true);
            });
          } else {
            this.sharedService.clearCurrentSprintItemId();
          }
        } else {
          console.error('Unexpected response structure:', response);
          this.sharedService.clearCurrentSprintItemId();
        }
      },
      error => {
        this.isLoading = false;
        console.error('Failed to load sprint items:', error);
        this.sharedService.clearCurrentSprintItemId();
      }
    );
  }

  setCurrentSprintItem(sprintItem: SprintItem) {
    this.focusedRowKey = sprintItem.id;
    this.currentSprintItem = sprintItem;
    this.sharedService.setCurrentSprintItemId(sprintItem.id);
    console.log('Current Sprint Item:', sprintItem);
  }


  getKindText = (rowData: any) => {
    if (!this.kindOptions || !rowData || !rowData.kind) return '';
    const kindOption = this.kindOptions.find(option => option.value === rowData.kind);
    return kindOption ? kindOption.text : '';
  };
  

  onSelectionChanged(event: any) {
    const selectedItem = event.selectedRowsData[0];
    if (selectedItem) {
      this.setCurrentSprintItem(selectedItem);
    } else {
      this.sharedService.clearCurrentSprintItemId();
    }
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

  onRowInserting(event: any) {
    this.isLoading = true;
    const newData = event.data;

    if (this.currentSprintId) {
      this.sprintItemService.addSprintItem(newData.kind, this.currentSprintId)
        .subscribe(response => {
          this.isLoading = false;
          console.log('Sprint Item added:', response);
          this.loadSprintItems(this.currentSprintId!);
          this.showToast('Added the sprint Item successfully', 'success');
        }, error => {
          this.isLoading = false;
          console.error('Error adding sprint item:', error);
          this.showToast('Cannot Add the sprint Item successfully', 'error');
        });
    }
  }

  onInitNewRow(event:InitNewRowEvent){
    event.data = {...event.data, productRequirementName:"Étude du projet",sprintName:"04-30-2024"}
  }

  onEditingStart(event:EditingStartEvent){
    this.currentSprintItem = event.data
  }

  onRowRemoving(event: any) {
    this.isLoading = true;
    const sprintItemId = event.key;

    if (this.currentSprintId) {
      this.sprintItemService.deleteSprintItem(sprintItemId, this.currentSprintId!).subscribe(
        () => {
          this.isLoading = false;
          console.log('Sprint Item deleted:', sprintItemId);
          this.loadSprintItems(this.currentSprintId!);
          this.showToast('Sprint Item deleted successfully', 'success');
        },
        error => {
          this.isLoading = false;
          console.error('Error deleting sprint item:', error);
          this.showToast('Failed to delete sprint item', 'error');
        }
      );
    } else {
      this.isLoading = false;
      console.error('No sprint selected!');
      this.showToast('No sprint selected!', 'warning');
    }
  }

  onRowUpdating(event: any) {
    this.isLoading = true;
    const updatedData = { ...event.oldData, ...event.newData };
    this.sprintItemService.updateSprintItem(event.key, updatedData.kind, this.currentSprintId!)
      .subscribe(response => {
        this.isLoading = false;
        console.log('Sprint item updated:', response);
        this.loadSprintItems(this.currentSprintId!);
        this.showToast('Sprint item updated successfully', 'success');
      }, error => {
        this.isLoading = false;
        console.error('Error updating sprint item:', error);
        this.showToast('Error updating sprint item', 'error');
      });
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.isToastVisible = true;
  }
}