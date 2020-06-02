import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SDegreePlanEditorComponent } from './s-degree-plan-editor.component';

describe('SDegreePlanEditorComponent', () => {
  let component: SDegreePlanEditorComponent;
  let fixture: ComponentFixture<SDegreePlanEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SDegreePlanEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SDegreePlanEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
