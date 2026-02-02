import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSignal = signal<boolean>(false);
  private loadingCount = 0;

  readonly isLoading = this.loadingSignal.asReadonly();

  show(): void {
    this.loadingCount++;
    this.loadingSignal.set(true);
  }

  hide(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.loadingSignal.set(false);
    }
  }

  reset(): void {
    this.loadingCount = 0;
    this.loadingSignal.set(false);
  }
}
