import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';

interface Item {
  _id: string;
  titulo?: string;
  descricao?: string;
  photo: string;
  __v: number;
}

@Component({
  selector: 'app-item-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-edit.component.html',
  styleUrls: []
})
export class ItemEditComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loadingItem = signal(false);
  loadingSubmit = signal(false);
  currentItem = signal<Item | null>(null);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  itemId: string | null = null;

  itemForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    descricao: ['']
  });

  ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      this.loadItem();
    } else {
      this.router.navigate(['/items']);
    }
  }

  loadItem() {
    if (!this.itemId) return;

    this.loadingItem.set(true);
    this.apiService.get<Item>(`items/findById/${this.itemId}`).subscribe({
      next: (item) => {
        this.currentItem.set(item);
        this.populateForm(item);
        this.loadingItem.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar item:', error);
        this.loadingItem.set(false);
      }
    });
  }

  populateForm(item: Item) {
    this.itemForm.patchValue({
      titulo: item.titulo || '',
      descricao: item.descricao || ''
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.itemForm.valid && this.itemId) {
      this.loadingSubmit.set(true);

      const formData = new FormData();
      formData.append('titulo', this.itemForm.get('titulo')?.value);
      formData.append('descricao', this.itemForm.get('descricao')?.value || '');

      if (this.selectedFile()) {
        formData.append('photo', this.selectedFile()!);
      }

      // Para updates, você pode usar PUT ou PATCH dependendo da sua API
      this.apiService.put(`items/${this.itemId}`, formData).subscribe({
        next: (response) => {
          console.log('Item atualizado com sucesso:', response);
          this.loadingSubmit.set(false);
          this.router.navigate(['/items']);
        },
        error: (error) => {
          console.error('Erro ao atualizar item:', error);
          this.loadingSubmit.set(false);
        }
      });
    }
  }

  resetForm() {
    if (this.currentItem()) {
      this.populateForm(this.currentItem()!);
      this.selectedFile.set(null);
      this.imagePreview.set(null);
    }
  }

  goBack() {
    this.router.navigate(['/items']);
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.itemForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
