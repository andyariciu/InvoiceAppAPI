import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCreate } from './invoice-create';

describe('InvoiceCreate', () => {
  let component: InvoiceCreate;
  let fixture: ComponentFixture<InvoiceCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
