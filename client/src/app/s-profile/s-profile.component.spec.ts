import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SProfileComponent } from './s-profile.component';

describe('SProfileComponent', () => {
  let component: SProfileComponent;
  let fixture: ComponentFixture<SProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
