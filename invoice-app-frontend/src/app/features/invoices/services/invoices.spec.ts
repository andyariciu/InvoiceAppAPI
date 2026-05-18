import { TestBed } from '@angular/core/testing';

import { Invoices } from './invoices';

describe('Invoices', () => {
  let service: Invoices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Invoices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
