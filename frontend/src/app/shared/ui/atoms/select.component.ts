import { Component, input, forwardRef, signal, ChangeDetectionStrategy, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export type SelectSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-select, ui-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full">
      <!-- Label -->
      @if (label()) {
        <label 
          [for]="selectId()" 
          class="block text-sm font-medium text-text-primary mb-1.5"
          [class.text-danger-600]="hasError()"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-danger-500 ml-0.5">*</span>
          }
        </label>
      }

      <!-- Select wrapper -->
      <div class="relative">
        <select
          [id]="selectId()"
          [disabled]="disabled()"
          [required]="required()"
          [attr.aria-invalid]="hasError() ? 'true' : null"
          [attr.aria-describedby]="hasError() ? selectId() + '-error' : hint() ? selectId() + '-hint' : null"
          [value]="value()"
          (change)="onSelect($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [class]="selectClasses()"
        >
          <!-- Placeholder option -->
          @if (placeholder()) {
            <option value="" disabled [selected]="!value()">{{ placeholder() }}</option>
          }

          <!-- Options -->
          @for (option of options(); track option.value) {
            <option 
              [value]="option.value" 
              [disabled]="option.disabled"
              [selected]="value() === option.value"
            >
              {{ option.label }}
            </option>
          }
        </select>

        <!-- Dropdown Icon -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            class="w-5 h-5 text-secondary-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fill-rule="evenodd" 
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
              clip-rule="evenodd" 
            />
          </svg>
        </div>
      </div>

      <!-- Hint / Error Message -->
      @if (hasError() && errorMessage()) {
        <p 
          [id]="selectId() + '-error'"
          class="mt-1.5 text-sm text-danger-600 flex items-center gap-1"
          role="alert"
        >
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ errorMessage() }}
        </p>
      } @else if (hint()) {
        <p 
          [id]="selectId() + '-hint'"
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
    select {
      appearance: none;
      background-image: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  // Inputs
  options = input<SelectOption[]>([]);
  size = input<SelectSize>('md');
  label = input<string>('');
  placeholder = input<string>('');
  hint = input<string>('');
  errorMessage = input<string>('');
  hasError = input<boolean>(false);
  disabled = input<boolean>(false);
  required = input<boolean>(false);

  // State
  value = signal<string | number>('');
  focused = signal<boolean>(false);

  // Unique ID for accessibility
  selectId = signal(`select-${Math.random().toString(36).substr(2, 9)}`);

  // Outputs
  valueChange = output<string | number>();
  blurred = output<void>();

  // ControlValueAccessor
  private onChange: (value: string | number) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: string | number): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled via input property
  }

  // Computed select classes
  selectClasses = computed(() => {
    const baseClasses = [
      'block w-full',
      'rounded-md border',
      'font-normal',
      'pr-10',
      'transition-all duration-200',
      'cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-secondary-50 disabled:text-text-muted disabled:cursor-not-allowed',
      'dark:bg-secondary-800 dark:text-secondary-100',
    ].join(' ');

    const sizeClasses: Record<SelectSize, string> = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2.5 text-sm min-h-[42px]',
      lg: 'px-4 py-3 text-base min-h-[50px]',
    };

    const stateClasses = this.hasError()
      ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200 dark:border-danger-600'
      : 'border-border-color focus:border-primary-500 focus:ring-primary-200 dark:border-secondary-600';

    return [
      baseClasses,
      sizeClasses[this.size()],
      stateClasses,
    ].join(' ');
  });

  // Event handlers
  onSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newValue = target.value;
    this.value.set(newValue);
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
    this.blurred.emit();
  }

  onFocus(): void {
    this.focused.set(true);
  }
}
