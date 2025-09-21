import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background-color: #3f51b5;
      color: white;
      padding: 1rem;
      text-align: center;
    }

    .app-main {
      flex: 1;
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'angular-crud-app';
}
