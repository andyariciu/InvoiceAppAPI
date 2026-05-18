import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceEdit } from './invoice-edit';

describe('InvoiceEdit', () => {
  let component: InvoiceEdit;
  let fixture: ComponentFixture<InvoiceEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
