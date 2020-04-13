import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SDashboardComponent } from './s-dashboard.component';

describe('SDashboardComponent', () => {
  let component: SDashboardComponent;
  let fixture: ComponentFixture<SDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
