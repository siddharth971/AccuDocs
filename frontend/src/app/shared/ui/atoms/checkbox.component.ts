import { Component, input, forwardRef, signal, ChangeDetectionStrategy, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type CheckboxSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-checkbox, ui-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label 
      [for]="checkboxId()" 
      class="inline-flex items-start gap-3 cursor-pointer group"
      [class.cursor-not-allowed]="disabled()"
      [class.opacity-60]="disabled()"
    >
      <!-- Custom Checkbox -->
      <div class="relative shrink-0" [class]="wrapperSizeClass()">
        <input
          type="checkbox"
          [id]="checkboxId()"
          [checked]="checked()"
          [disabled]="disabled()"
          [indeterminate]="indeterminate()"
          [attr.aria-checked]="indeterminate() ? 'mixed' : checked()"
          [attr.aria-describedby]="description() ? checkboxId() + '-desc' : null"
          class="sr-only peer"
          (change)="onToggle($event)"
          (focus)="focused.set(true)"
          (blur)="focused.set(false)"
        />
        <div 
          [class]="checkboxClasses()"
        >
          <!-- Checkmark icon -->
          @if (checked() && !indeterminate()) {
            <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }

          <!-- Indeterminate icon -->
          @if (indeterminate()) {
            <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M5 12h14" stroke-linecap="round" />
            </svg>
          }
        </div>
      </div>

      <!-- Label Content -->
      <div class="flex flex-col gap-0.5">
        @if (label()) {
          <span 
            class="text-text-primary font-medium select-none"
            [class.text-sm]="size() === 'sm'"
            [class.text-base]="size() === 'md' || size() === 'lg'"
          >
            {{ label() }}
            @if (required()) {
              <span class="text-danger-500 ml-0.5">*</span>
            }
          </span>
        }
        @if (description()) {
          <span 
            [id]="checkboxId() + '-desc'"
            class="text-text-secondary text-sm"
          >
            {{ description() }}
          </span>
        }
      </div>
    </label>

    <!-- Error message -->
    @if (hasError() && errorMessage()) {
      <p class="mt-1.5 text-sm text-danger-600 flex items-center gap-1 ml-8" role="alert">
        {{ errorMessage() }}
      </p>
    }
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
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  // Inputs
  size = input<CheckboxSize>('md');
  label = input<string>('');
  description = input<string>('');
  errorMessage = input<string>('');
  hasError = input<boolean>(false);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  indeterminate = input<boolean>(false);

  // State
  checked = signal<boolean>(false);
  focused = signal<boolean>(false);

  // Unique ID for accessibility
  checkboxId = signal(`checkbox-${Math.random().toString(36).substr(2, 9)}`);

  // Outputs
  checkedChange = output<boolean>();

  // ControlValueAccessor
  private onChange: (value: boolean) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled via input property
  }

  // Size class for wrapper
  wrapperSizeClass(): string {
    const sizeMap: Record<CheckboxSize, string> = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };
    return sizeMap[this.size()];
  }

  // Computed checkbox visual classes
  checkboxClasses = computed(() => {
    const base = [
      'flex items-center justify-center',
      'rounded-sm',
      'border-2',
      'transition-all duration-200',
      'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-200 peer-focus-visible:ring-offset-1',
    ];

    const sizeClasses: Record<CheckboxSize, string> = {
      sm: 'w-4 h-4 p-0.5',
      md: 'w-5 h-5 p-0.5',
      lg: 'w-6 h-6 p-1',
    };

    const stateClasses = this.checked() || this.indeterminate()
      ? 'bg-primary-600 border-primary-600 text-white dark:bg-primary-500 dark:border-primary-500'
      : 'bg-white border-secondary-300 group-hover:border-primary-400 dark:bg-secondary-800 dark:border-secondary-600';

    const errorClasses = this.hasError() && !this.checked()
      ? 'border-danger-500'
      : '';

    return [
      ...base,
      sizeClasses[this.size()],
      stateClasses,
      errorClasses,
    ].join(' ');
  });

  // Event handler
  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.checked;
    this.checked.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.checkedChange.emit(newValue);
  }
}
