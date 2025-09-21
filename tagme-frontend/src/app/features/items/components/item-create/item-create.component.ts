import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-item-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'item-create.component.html',
  styleUrls: []
})
export class ItemCreateComponent {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  serverErrors = signal<{[key: string]: string[]}>({});

  itemForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    descricao: ['']
  });
  hasServerError(fieldName: string): boolean {
    return this.serverErrors()[fieldName]?.length > 0;
  }

  getServerErrors(fieldName: string): string[] {
    return this.serverErrors()[fieldName] || [];
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
    if (this.itemForm.valid) {
      this.loading.set(true);

      const formData = new FormData();
      formData.append('titulo', this.itemForm.get('titulo')?.value);
      formData.append('descricao', this.itemForm.get('descricao')?.value || '');

      if (this.selectedFile()) {
        formData.append('photo', this.selectedFile()!);
      }

      this.apiService.post('items/create', formData).subscribe({
        next: (response) => {
          console.log('Item criado com sucesso:', response);
          this.loading.set(false);
          this.router.navigate(['/items']);
        },
        error: (error) => {
          console.error('Erro ao criar item:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    }
  }

  private processValidationErrors(messages: string[]) {
    const errors: {[key: string]: string[]} = {};

    messages.forEach(message => {
      if (message.toLowerCase().includes('titulo')) {
        errors['titulo'] = errors['titulo'] || [];
        errors['titulo'].push(message);
      } else if (message.toLowerCase().includes('descricao') || message.toLowerCase().includes('descrição')) {
        errors['descricao'] = errors['descricao'] || [];
        errors['descricao'].push(message);
      } else if (message.toLowerCase().includes('photo') || message.toLowerCase().includes('foto') || message.toLowerCase().includes('imagem')) {
        errors['photo'] = errors['photo'] || [];
        errors['photo'].push(message);
      } else {
        this.errorMessage.set(message);
      }
    });

    if (Object.keys(errors).length > 0) {
      this.serverErrors.set(errors);
    }
  }

  private handleError(error: any) {
    if (error.status === 400 && error.error) {

      if (error.error.message && Array.isArray(error.error.message)) {

        this.processValidationErrors(error.error.message);
      } else if (error.error.errors) {

        this.serverErrors.set(error.error.errors);
      } else if (error.error.message) {

        this.errorMessage.set(error.error.message);
      } else {
        this.errorMessage.set('Dados inválidos. Verifique os campos e tente novamente.');
      }
    } else if (error.status === 404) {

      this.errorMessage.set('Item não encontrado.');
    } else if (error.status === 413) {

      this.errorMessage.set('Arquivo muito grande. Escolha uma imagem menor.');
    } else if (error.status === 415) {

      this.errorMessage.set('Tipo de arquivo não suportado. Use apenas imagens.');
    } else if (error.status === 0) {

      this.errorMessage.set('Erro de conexão. Verifique sua internet e tente novamente.');
    } else {

      this.errorMessage.set(error.error?.message || 'Erro interno do servidor. Tente novamente.');
    }
  }

  resetForm() {
    this.itemForm.reset();
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  goBack() {
    this.router.navigate(['/items']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.itemForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
