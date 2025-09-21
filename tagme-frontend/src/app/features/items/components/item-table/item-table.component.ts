import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

interface Item {
  _id: string;
  titulo?: string;
  descricao?: string;
  photo: string;
  __v: number;
}

interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

interface ApiResponse {
  items: Item[];
  meta: PaginationMeta;
}

@Component({
  selector: 'app-items-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-table.component.html',
  styleUrls: [`./item-table.component.scss`]
})
export class ItemsTableComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  meta: PaginationMeta | null = null;
  loading = false;

  // Signals para controle de estado
  showDeleteModal = signal(false);
  itemToDelete = signal<Item | null>(null);
  deleting = signal<string | null>(null);

  private apiService = inject(ApiService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private currentRequestPage: number | null = null;

  ngOnInit() {
    this.loadItems(1);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadItems(page: number = 1) {
    this.loading = true;
    this.currentRequestPage = page;

    this.apiService.get<ApiResponse>(`items/pagination?page=${page}&limit=5`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.items = response.items || [];
          this.meta = response.meta;
          this.loading = false;
          this.currentRequestPage = null;
        },
        error: (error) => {
          console.error('Erro ao carregar items:', error);
          this.loading = false;
          this.currentRequestPage = null;
        }
      });
  }

  changePage(page: number) {
    this.loadItems(page);
  }

  createItem() {
    this.router.navigate(['/items/create']);
  }


  editItem(itemId: string) {
    this.router.navigate(['/items', itemId, 'edit']);
  }

  confirmDelete(item: Item) {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
  }

  deleteItem() {
    const item = this.itemToDelete();
    if (!item) return;

    this.deleting.set(item._id);

    this.apiService.delete(`items/${item._id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Item excluído com sucesso');
          this.deleting.set(null);
          this.showDeleteModal.set(false);
          this.itemToDelete.set(null);

          // Recarregar a página atual ou voltar para página 1 se não houver mais items
          const currentPage = this.meta?.currentPage || 1;
          const totalItems = (this.meta?.totalItems || 1) - 1;
          const itemsPerPage = this.meta?.itemsPerPage || 5;
          const newTotalPages = Math.ceil(totalItems / itemsPerPage) || 1;

          if (currentPage > newTotalPages) {
            this.loadItems(newTotalPages);
          } else {
            this.loadItems(currentPage);
          }
        },
        error: (error) => {
          console.error('Erro ao excluir item:', error);
          this.deleting.set(null);
          // Você pode adicionar uma notificação de erro aqui
        }
      });
  }

  getPageNumbers(): number[] {
    if (!this.meta || this.meta.totalPages <= 1) {
      return [];
    }

    const { currentPage, totalPages } = this.meta;
    const pages: number[] = [];

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getPhotoUrl(photoPath: string): string {
    if (!photoPath) {
      return this.getPlaceholderImage();
    }
    return `http://localhost:3000/items/${photoPath}`;
  }

  onImageError(event: any) {
    console.log('Erro ao carregar imagem');
    event.target.src = this.getPlaceholderImage();
  }

  private getPlaceholderImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
  }

  // TrackBy functions para otimizar performance
  trackByItemId(index: number, item: Item): string {
    return item._id;
  }

  trackByPageNumber(index: number, page: number): number {
    return page;
  }
}
