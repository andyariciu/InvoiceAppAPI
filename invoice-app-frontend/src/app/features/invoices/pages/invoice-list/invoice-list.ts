import { Component, inject, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Invoices } from '../../services/invoices';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
})

export class InvoiceList implements OnInit {

  isUploadModalOpen = false;
  private invoicesService = inject(Invoices);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(Auth);
  private router = inject(Router);
  invoices: any[] = [];
  searchString: string = '';
  error: string | null = null;
  minTotalFilter: number | null = null;
  loading = true;
  selectedFile: File | null = null;
  errors: any[] = [];

  ngOnInit(): void {
    //load all invoices when after page loads
    this.loadInvoices();
  }

  loadInvoices(): void {
  this.loading = true;
  this.cdr.detectChanges();
  this.invoicesService
    .getInvoices(this.searchString, this.minTotalFilter ?? undefined)
    .subscribe({
      next: (response) => {
        this.invoices = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error when loading the invoices:', err);
        this.loading = false;
        this.error = "Couldn't load invoices.";
        this.cdr.detectChanges();
      }
    });
  }

  onApplyFilters(): void {
    this.loadInvoices();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.clearLocalSession(),
      error: () => this.clearLocalSession()
    });
  }

  private clearLocalSession(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

 onFileSelected(event: any): void {
  const file: File = event.target.files[0];
  if (!file) return;

  // check if it's excel file
  if (file.name.split('.').pop() !== 'xlsx') {
    alert('Only .xlsx (Excel) are allowed!');
    return;
  }

  this.selectedFile = file;
}

onUpload(): void {
  if (!this.selectedFile) {
    alert('Please check a file first!');
    return;
  }

  const cutieTransport = new FormData();
  cutieTransport.append('file', this.selectedFile);

  this.loading = false;
  this.cdr.detectChanges();

  this.invoicesService.uploadInvoices(cutieTransport).subscribe({
    next: (res) => {
      this.loading = false;
      alert(`Success! You have uploaded ${res.inserted} invoices.`);
      this.selectedFile = null; // reset input
      this.isUploadModalOpen = false;
      this.loadInvoices();      // reload table
    },
    error: (err) => {
      this.loading = false;
      this.cdr.detectChanges();
      console.error(err);
      alert('ERROR.');
    }
  });
}

}
