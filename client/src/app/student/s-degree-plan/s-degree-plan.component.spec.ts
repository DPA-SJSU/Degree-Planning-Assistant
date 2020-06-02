import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SDegreePlanComponent } from './s-degree-plan.component';

describe('SDegreePlanComponent', () => {
  let component: SDegreePlanComponent;
  let fixture: ComponentFixture<SDegreePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SDegreePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SDegreePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
