import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared/shared.service';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentView: string = 'sprint';
  currentSprintId: string | null = null;
  currentSprintItemId: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private sharedService: SharedService, private loginService: LoginService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.sharedService.currentSprintId$.subscribe(sprintId => {
        this.currentSprintId = sprintId;
      }),
      this.sharedService.currentSprintItemId$.subscribe(sprintItemId => {
        this.currentSprintItemId = sprintItemId;
      })
    );
    this.setView('sprint');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setView(view: string) {
    this.currentView = view;
    this.router.navigate([`/dashboard/${view}`]);
  }

  isActive(view: string): boolean {
    return this.currentView === view;
  }

  showSprintItems(): boolean {
    return !!this.currentSprintId;
  }

  showWorkItems(): boolean {
    return !!this.currentSprintItemId;
  }

  logout() {
    this.loginService.logout();
    this.currentSprintId = null;
    this.currentSprintItemId = null;
    this.sharedService.clearCurrentSprintId();
    this.sharedService.clearCurrentSprintItemId();
    this.setView('sprint');
    this.router.navigate(['/login']);
  }
}
