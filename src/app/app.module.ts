// Import necessary Angular modules and components
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Importing custom components
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SprintComponent } from './sprint/sprint.component';
import { LoginComponent } from './login/login.component';
import { TeamMembersComponent } from './team-members/team-members.component';

// Importing DevExtreme modules for UI components
import { DxDataGridModule, DxPopupModule, DxButtonModule,DxSortableModule,DxListModule,DxValidatorModule,DxToastModule} from 'devextreme-angular';

// Import services and guard
import { AuthGuard } from './auth/auth.guard';
import { AuthInterceptor } from './services/auth-interceptor.service'; 
import { TeamMembersService } from './services/team-members.service'; 
import { SprintService } from './services/sprint.service';
import { SprintItemsComponent } from './sprint-items/sprint-items.component';
import { WorkItemsComponent } from './work-items/work-items.component';
import { KanbanComponent } from './kanban/kanban.component';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SprintComponent,
    LoginComponent,
    TeamMembersComponent,
    SprintItemsComponent,
    WorkItemsComponent,
    KanbanComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DxDataGridModule,
    DxButtonModule,
    DxSortableModule,
    DxValidatorModule,
    DxToastModule,
    DxListModule,
    DxPopupModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [AuthGuard], 
        children: [
          { path: 'sprint', component: SprintComponent, canActivate: [AuthGuard] },
          { path: 'team-members', component: TeamMembersComponent, canActivate: [AuthGuard] },
          { path: 'sprint-items', component: SprintItemsComponent, canActivate: [AuthGuard] },
          { path: 'work-items', component: WorkItemsComponent, canActivate: [AuthGuard] },

        ]
      },
      { path: '**', redirectTo: 'login' }
    ])
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    TeamMembersService,
    SprintService 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
