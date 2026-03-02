import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-6 py-4">
      <div class="mb-6">
        <h1 class="text-2xl font-bold dark:text-white">Recurring Billing Rules</h1>
        <p class="text-sm text-gray-500">Manage monthly, quarterly, and yearly automated retainers.</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center text-gray-500">
        <p class="text-lg">Recurring Rules view coming soon!</p>
      </div>
    </div>
  `
})
export class RecurringListComponent { }
