import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SCoursesTakenComponent } from './s-courses-taken.component';

describe('SCoursesTakenComponent', () => {
  let component: SCoursesTakenComponent;
  let fixture: ComponentFixture<SCoursesTakenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SCoursesTakenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SCoursesTakenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
