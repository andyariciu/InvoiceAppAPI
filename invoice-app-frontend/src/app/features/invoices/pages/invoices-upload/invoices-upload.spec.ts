import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesUpload } from './invoices-upload';

describe('InvoicesUpload', () => {
  let component: InvoicesUpload;
  let fixture: ComponentFixture<InvoicesUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesUpload],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
