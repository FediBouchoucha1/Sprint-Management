import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintItemsComponent } from './sprint-items.component';

describe('SprintItemsComponent', () => {
  let component: SprintItemsComponent;
  let fixture: ComponentFixture<SprintItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SprintItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SprintItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
