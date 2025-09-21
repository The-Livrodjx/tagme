import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-overlay">
      <mat-spinner></mat-spinner>
      <p>Carregando...</p>
    </div>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
  `]
})
export class LoadingSpinnerComponent {}
