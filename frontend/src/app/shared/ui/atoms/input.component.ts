import { Component, input, forwardRef, signal, ChangeDetectionStrategy, computed, output, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input, ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full">
      <!-- Label -->
      @if (label()) {
        <label 
          [for]="inputId()" 
          class="block text-sm font-medium text-text-primary mb-1.5"
          [class.text-danger-600]="hasError()"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-danger-500 ml-0.5">*</span>
          }
        </label>
      }

      <!-- Input wrapper -->
      <div class="relative">
        <!-- Prefix Icon -->
        @if (prefixIcon()) {
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ng-content select="[prefix-icon]"></ng-content>
          </div>
        }

        <!-- Input field -->
        <input
          [id]="inputId()"
          [type]="currentType()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [required]="required()"
          [attr.aria-invalid]="hasError() ? 'true' : null"
          [attr.aria-describedby]="hasError() ? inputId() + '-error' : hint() ? inputId() + '-hint' : null"
          [attr.autocomplete]="autocomplete()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [class]="inputClasses()"
        />

        <!-- Suffix Icons / Actions -->
        <div class="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          <!-- Clear button -->
          @if (clearable() && value() && !disabled()) {
            <button
              type="button"
              (click)="onClear()"
              class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              aria-label="Clear input"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }

          <!-- Password toggle -->
          @if (type() === 'password') {
            <button
              type="button"
              (click)="togglePasswordVisibility()"
              class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
            >
              @if (showPassword()) {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              } @else {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            </button>
          }

          <!-- Custom suffix icon -->
          @if (suffixIcon()) {
            <ng-content select="[suffix-icon]"></ng-content>
          }
        </div>
      </div>

      <!-- Hint / Error Message -->
      @if (hasError() && errorMessage()) {
        <p 
          [id]="inputId() + '-error'"
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  // Inputs
  type = input<InputType>('text');
  size = input<InputSize>('md');
  label = input<string>('');
  placeholder = input<string>('');
  hint = input<string>('');
  errorMessage = input<string>('');
  hasError = input<boolean>(false);
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  clearable = input<boolean>(false);
  prefixIcon = input<boolean>(false);
  suffixIcon = input<boolean>(false);
  autocomplete = input<string>('off');

  // State
  value = signal<string>('');
  showPassword = signal<boolean>(false);
  focused = signal<boolean>(false);

  // Unique ID for accessibility
  inputId = signal(`input-${Math.random().toString(36).substr(2, 9)}`);

  // Outputs
  valueChange = output<string>();
  blurred = output<void>();
  focused$ = output<void>();

  // ControlValueAccessor
  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled via input property
  }

  // Computed current input type (for password toggle)
  currentType = computed(() => {
    if (this.type() === 'password' && this.showPassword()) {
      return 'text';
    }
    return this.type();
  });

  // Computed input classes
  inputClasses = computed(() => {
    const baseClasses = [
      'block w-full',
      'rounded-md border',
      'font-normal',
      'transition-all duration-200',
      'placeholder:text-text-muted',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-secondary-50 disabled:text-text-muted disabled:cursor-not-allowed',
      'dark:bg-secondary-800 dark:text-secondary-100',
    ].join(' ');

    const sizeClasses: Record<InputSize, string> = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2.5 text-sm min-h-[42px]',
      lg: 'px-4 py-3 text-base min-h-[50px]',
    };

    const stateClasses = this.hasError()
      ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200 dark:border-danger-600'
      : 'border-border-color focus:border-primary-500 focus:ring-primary-200 dark:border-secondary-600';

    const paddingAdjust = [];
    if (this.prefixIcon()) {
      paddingAdjust.push('pl-10');
    }
    if (this.suffixIcon() || this.clearable() || this.type() === 'password') {
      paddingAdjust.push('pr-10');
    }

    return [
      baseClasses,
      sizeClasses[this.size()],
      stateClasses,
      ...paddingAdjust,
    ].join(' ');
  });

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
    this.valueChange.emit(target.value);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
    this.blurred.emit();
  }

  onFocus(): void {
    this.focused.set(true);
    this.focused$.emit();
  }

  onClear(): void {
    this.value.set('');
    this.onChange('');
    this.valueChange.emit('');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
}
