import { inject, Injectable, signal, computed } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Injectable()
export class StaffFacade {
  private userService = inject(UserService);

  // State signals
  searchQuery = signal('');
  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  roleFilter = signal<'admin' | undefined>('admin');

  // Resource for declarative data fetching
  staffResource = rxResource({
    request: () => ({
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
      search: this.searchQuery(),
      role: this.roleFilter(),
      // active: undefined
    }),
    loader: (req) => this.userService.getUsers(
      req.request.page,
      req.request.limit,
      req.request.search,
      req.request.role
    ),
  });

  // Computed views
  staff = computed(() => this.staffResource.value()?.data || []);
  totalCount = computed(() => this.staffResource.value()?.meta?.total || 0);
  isLoading = computed(() => this.staffResource.isLoading());

  updatePagination(pageIndex: number, pageSize: number) {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
  }

  updateSort(active: string, direction: 'asc' | 'desc' | '') {
    this.sortBy.set(active);
    this.sortOrder.set((direction as 'asc' | 'desc') || 'desc');
  }

  reload() {
    this.staffResource.reload();
  }
}
