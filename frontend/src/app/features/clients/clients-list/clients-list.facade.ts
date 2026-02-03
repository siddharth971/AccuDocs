import { inject, Injectable, signal, computed } from '@angular/core';
import { ClientService, Client } from '@core/services/client.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable()
export class ClientsFacade {
  private clientService = inject(ClientService);

  // State signals
  searchQuery = signal('');
  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Resource for declarative data fetching
  clientResource = rxResource({
    request: () => ({
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
      search: this.searchQuery(),
      sort: this.sortBy(),
      order: this.sortOrder(),
    }),
    loader: (req) => this.clientService.getClients(
      req.request.page,
      req.request.limit,
      req.request.search,
      req.request.sort,
      req.request.order
    ),
  });

  // Computed views
  clients = computed(() => this.clientResource.value()?.data || []);
  totalCount = computed(() => this.clientResource.value()?.meta?.total || 0);
  isLoading = computed(() => this.clientResource.isLoading());

  updatePagination(pageIndex: number, pageSize: number) {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
  }

  updateSort(active: string, direction: 'asc' | 'desc' | '') {
    this.sortBy.set(active);
    this.sortOrder.set((direction as 'asc' | 'desc') || 'desc');
  }

  reload() {
    this.clientResource.reload();
  }

  async deleteClient(id: string) {
    // We can't really await the observable without firstValueFrom, 
    // but typically we'd just subscribe or use firstValueFrom.
    // Let's use firstValueFrom for a cleaner async/await flow.
    // However, I need to make sure I import firstValueFrom.
    // Actually, I can just subscribe since we just want to reload after completion.
    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        console.error('Failed to delete client', err);
        // Ideally show a toast here, but for now console error is fine 
        // as per current context constraints.
      }

    });
  }

  openCreateModal() {
    // This method is called by the UI when the "Add" button is clicked.
    // In a real application, this would open a modal dialog or navigate to a create page.
    // For now, we can just log a message or implement a simple alert.
    console.log('Open Create Modal');
  }
}
