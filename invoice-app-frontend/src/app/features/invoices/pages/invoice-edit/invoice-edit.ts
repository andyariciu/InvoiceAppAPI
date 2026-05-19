import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Invoices } from '../../services/invoices';

@Component({
  selector: 'app-invoice-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './invoice-edit.html',
  styleUrl: './invoice-edit.scss',
})
export class InvoiceEdit implements OnInit {

  private fb = inject(FormBuilder);
  private invoicesService = inject(Invoices);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  
  invoice: any = null;
  message: string = '';
  invoiceId = 0;
  loading = true;
  isSuccess = false;

  invoiceForm = this.fb.nonNullable.group({
    clientName: ['', Validators.required],
    total: [0,[Validators.required,Validators.min(0.01)]]
  });

  ngOnInit(): void {
    this.invoiceId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.invoicesService
      .getInvoiceById(this.invoiceId)
      .subscribe({
        next: response => {
          this.invoiceForm.patchValue({
            clientName: response.clientName,
            total: response.total
          });
          this.invoice = response;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error(error);
          this.message =
            'Invoice not found or access denied.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit() {

    this.isSuccess = false;
    this.message = '';
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    this.invoicesService
      .updateInvoice(
        this.invoiceId,
        this.invoiceForm.getRawValue()
      )
      .subscribe({
        next: response => {
          console.log('INVOICE UPDATED', response);
          this.isSuccess = true;
          this.loading = false;
          this.message = 'Invoice has been updated.';
          this.cdr.detectChanges();
        },
        error: error => {
          console.error(error);
          this.message = 'An error has occurred. Invoice has not been updated.';
          this.cdr.detectChanges(); 
        }
      });
  }

  onDelete(){
    this.isSuccess = false;
    this.message = '';

    if (!this.invoice || !this.invoice.id) {
      this.message = "Cannot delete: Invoice ID is missing.";
      this.isSuccess = false;
      return;
    }
    if (confirm(`Are you sure you want to delete invoice #${this.invoice.id}?`)) {
      this.loading = true;
      this.message = '';
      this.cdr.detectChanges();

      this.invoicesService.deleteInvoice(this.invoice.id).subscribe({
        next: () => {
          this.loading = false;
          this.isSuccess = true;
          this.message = "Invoice has been successfully deleted.";
          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/invoices']);
          }, 3000);
        },
        error: (err) => {
          this.loading = false;
          this.isSuccess = false;
          this.message = "An error occurred. Invoice could not be deleted.";
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    }
  }
}