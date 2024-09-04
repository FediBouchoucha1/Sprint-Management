import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxPopupComponent, DxToastComponent } from 'devextreme-angular';
import { SharedService } from '../shared/shared.service';
import { TeamMembersService } from '../services/team-members.service';
import { TeamMember, SprintTeamMemberResponse, PotentialTeamMember } from '../models/team-member.model';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.css']
})
export class TeamMembersComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) grid!: DxDataGridComponent;
  @ViewChild('popupGrid', { static: false }) popupGrid!: DxDataGridComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup!: DxPopupComponent;
  @ViewChild(DxToastComponent, { static: false }) toast!: DxToastComponent;

  teamMembersData: TeamMember[] = [];
  potentialTeamMembers: PotentialTeamMember[] = [];
  selectedPotentialMembers: PotentialTeamMember[] = [];
  private currentSprintId: string | null = null;

  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  isToastVisible: boolean = false;

  isLoading = false;
  isInitialLoad = true; 

  constructor(
    private sharedService: SharedService, 
    private teamMembersService: TeamMembersService
  ) {
   
  }

  ngOnInit() {
    this.currentSprintId = this.sharedService.getCurrentSprintId();
    if (this.currentSprintId) {
      this.loadTeamMembers(this.currentSprintId);
      this.loadPotentialTeamMembers();
    }
  }

  loadTeamMembers(sprintId: string) {
    if (this.isInitialLoad) {
      this.isLoading = true;
    }
    this.teamMembersService.fetchTeamMembers(sprintId).subscribe(
      (response: SprintTeamMemberResponse) => {
        this.isLoading = false;
        this.teamMembersData = (response.SprintTeamMember || []).map(member => new TeamMember(
          member.PersonId,
          member.PersonFirstName,
          member.PersonLastName,
          member.PersonEMail,
          member.PersonMobilePhone,
        ));
        if (this.isInitialLoad) {
          this.isInitialLoad = false; 
        }
      },
      (error) => {
        this.isLoading = false; 
        this.showToast('Failed to fetch team members', 'error');
        console.error('Failed to fetch team members:', error);
      }
    );
  }

  loadPotentialTeamMembers() {
    this.teamMembersService.fetchPotentialTeamMembers().subscribe(
      (response: PotentialTeamMember[]) => {
        this.potentialTeamMembers = response.filter(member => !this.teamMembersData.some(m => m.email === member.email));
      },
      (error) => {
        this.showToast('Failed to load potential team members', 'error');
        console.error('Failed to load potential team members:', error);
      }
    );
  }

  addNewTeamMember() {
    this.selectedPotentialMembers = [];
    this.popup.instance.show();

    setTimeout(() => {
      if (this.popupGrid && this.popupGrid.instance) {
        this.popupGrid.instance.clearSelection();
      }
    }, 0);
  }

  saveSelectedMembers() {
    if (!this.currentSprintId) {
      this.showToast('No sprint selected!', 'warning');
      console.error('No sprint selected!');
      return;
    }

    this.isLoading = true; 
    const selectedMemberIds = this.selectedPotentialMembers.map(member => member.id);

    this.teamMembersService.persistTeamMembers(this.currentSprintId, selectedMemberIds).subscribe(
      () => {
        this.isLoading = false;
        this.teamMembersService.clearTeamMembersCache(this.currentSprintId!);
        this.loadTeamMembers(this.currentSprintId!);
        this.loadPotentialTeamMembers();
        this.showToast('Team members successfully added!', 'success');
        this.popup.instance.hide();
      },
      error => {
        this.isLoading = false;
        this.showToast('Failed to persist team members', 'error');
        console.error('Failed to persist team members:', error);
      }
    );
  }

  onRowUpdating(event: any) {
    const updatedData = {
      ...event.oldData,
      ...event.newData
    };

    this.isLoading = true;
    this.teamMembersService.updateTeamMember(event.key, updatedData).subscribe(
      response => {
        this.isLoading = false; 
        console.log('Team member updated:', response);
        this.teamMembersService.clearTeamMembersCache(this.currentSprintId!);
        this.loadTeamMembers(this.currentSprintId!);
        this.showToast('Updated the team member successfully', 'success');
      },
      error => {
        this.isLoading = false;
        console.error('Error updating team member:', error);
        this.showToast('Error updating team member', 'error');
      }
    );
  }

  onRowRemoving(event: any) {
    this.isLoading = true;
    this.teamMembersService.deleteMember(event.key).subscribe(
      response => {
        this.isLoading = false;
        this.teamMembersService.clearTeamMembersCache(this.currentSprintId!);
        this.loadTeamMembers(this.currentSprintId!); 
        this.showToast('Removed the team member successfully', 'success');
      },
      error => {
        this.isLoading = false; 
        console.error('Error deleting team member:', error);
        this.showToast('Error deleting team member', 'error');
      }
    );
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.isToastVisible = true;
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

  toolbarItems = [
    {
      widget: 'dxButton',
      toolbar: 'bottom',
      location: 'after',
      options: {
        text: 'Cancel',
        onClick: () => {
          this.popup.instance.hide();
        },
        stylingMode: 'contained', 
        type: 'normal', 
        elementAttr: {
          class: 'cancel-button'
        }
      },
    },
    {
      widget: 'dxButton',
      toolbar: 'bottom',
      location: 'after',
      options: {
        text: 'Save',
        onClick: () => {
          this.saveSelectedMembers();
        },
        stylingMode: 'contained', 
        type: 'success', 
        elementAttr: {
          class: 'save-button'
        }
      },
    },
  ];
}
