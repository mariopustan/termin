import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { Contact } from '../../../../core/models/contact.model';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss',
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  total = 0;
  page = 1;
  limit = 20;
  search = '';
  loading = true;
  deleteConfirmId: string | null = null;

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    this.api.getContacts(this.search || undefined, this.page, this.limit).subscribe({
      next: (res) => {
        this.contacts = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadContacts();
    }, 300);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadContacts();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadContacts();
    }
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteContact(id: string): void {
    this.api.deleteContact(id).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadContacts();
      },
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '\u2014';
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
