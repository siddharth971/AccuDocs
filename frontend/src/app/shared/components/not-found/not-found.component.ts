import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="content">
        <mat-icon class="error-icon">search_off</mat-icon>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a mat-raised-button color="primary" routerLink="/dashboard">
          <mat-icon>home</mat-icon>
          Back to Dashboard
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .content {
      text-align: center;
      color: white;
    }

    .error-icon {
      font-size: 80px;
      height: 80px;
      width: 80px;
      opacity: 0.8;
    }

    h1 {
      font-size: 6rem;
      font-weight: 700;
      margin: 0;
      line-height: 1;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 400;
      margin: 0.5rem 0 1rem;
    }

    p {
      opacity: 0.8;
      margin-bottom: 2rem;
    }

    a {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
  `],
})
export class NotFoundComponent { }
