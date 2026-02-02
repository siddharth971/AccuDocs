import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../atoms/input.component';
import { SelectComponent } from '../atoms/select.component';
import { TextareaComponent } from '../atoms/textarea.component';

@Component({
  selector: 'app-form-group, ui-form-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="groupClasses()" [attr.role]="role()">
      <!-- Group Label -->
      @if (label()) {
        <label 
          [for]="inputId()"
          [class]="labelClasses()"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-danger-500 ml-0.5">*</span>
          }
          @if (optional()) {
            <span class="text-text-muted text-xs font-normal ml-1">(optional)</span>
          }
        </label>
      }

      <!-- Input Container -->
      <div class="relative">
        <ng-content></ng-content>
      </div>

      <!-- Helper Text / Error Message -->
      @if (error()) {
        <p 
          [id]="inputId() + '-error'"
          class="mt-1.5 text-sm text-danger-600 flex items-start gap-1"
          role="alert"
        >
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ error() }}
        </p>
      } @else if (hint()) {
        <p 
          [id]="inputId() + '-hint'"
          class="mt-1.5 text-sm text-text-muted"
        >
          {{ hint() }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGroupComponent {
  // Inputs
  label = input<string>('');
  hint = input<string>('');
  error = input<string>('');
  required = input<boolean>(false);
  optional = input<boolean>(false);
  inputId = input<string>(`form-group-${Math.random().toString(36).substr(2, 9)}`);
  inline = input<boolean>(false);
  compact = input<boolean>(false);
  role = input<string | null>(null);

  // Computed group classes
  groupClasses = computed(() => {
    const baseClasses = ['w-full'];

    if (this.inline()) {
      baseClasses.push('sm:flex sm:items-start sm:gap-4');
    }

    if (!this.compact()) {
      baseClasses.push('mb-4');
    }

    return baseClasses.join(' ');
  });

  // Computed label classes
  labelClasses = computed(() => {
    const baseClasses = [
      'block text-sm font-medium text-text-primary',
      'mb-1.5',
    ];

    if (this.inline()) {
      baseClasses.push('sm:w-1/3 sm:text-right sm:pt-2.5 sm:mb-0');
    }

    return baseClasses.join(' ');
  });
}
