import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SProfileDashComponent } from './s-profile-dash.component';

describe('SProfileDashComponent', () => {
  let component: SProfileDashComponent;
  let fixture: ComponentFixture<SProfileDashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SProfileDashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SProfileDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
