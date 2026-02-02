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
}
