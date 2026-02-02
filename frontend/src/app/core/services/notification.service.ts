import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  success(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['snackbar-success'],
    });
  }

  error(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration: 6000,
      panelClass: ['snackbar-error'],
    });
  }

  warning(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['snackbar-warning'],
    });
  }

  info(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['snackbar-info'],
    });
  }
}
