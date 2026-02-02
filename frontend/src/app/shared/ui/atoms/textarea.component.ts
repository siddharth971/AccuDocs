import { Component, input, forwardRef, signal, ChangeDetectionStrategy, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export type TextareaSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-textarea, ui-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full">
      <!-- Label -->
      @if (label()) {
        <label 
          [for]="textareaId()" 
          class="block text-sm font-medium text-text-primary mb-1.5"
          [class.text-danger-600]="hasError()"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-danger-500 ml-0.5">*</span>
          }
        </label>
      }

      <!-- Textarea wrapper -->
      <div class="relative">
        <textarea
          [id]="textareaId()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [required]="required()"
          [rows]="rows()"
          [attr.maxlength]="maxLength()"
          [attr.aria-invalid]="hasError() ? 'true' : null"
          [attr.aria-describedby]="hasError() ? textareaId() + '-error' : hint() ? textareaId() + '-hint' : null"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [class]="textareaClasses()"
        ></textarea>
      </div>

      <!-- Footer: Hint/Error + Character count -->
      <div class="flex items-start justify-between mt-1.5 gap-4">
        <!-- Hint / Error Message -->
        <div class="flex-1">
          @if (hasError() && errorMessage()) {
            <p 
              [id]="textareaId() + '-error'"
              class="text-sm text-danger-600 flex items-center gap-1"
              role="alert"
            >
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ errorMessage() }}
            </p>
          } @else if (hint()) {
            <p 
              [id]="textareaId() + '-hint'"
              class="text-sm text-text-muted"
            >
              {{ hint() }}
            </p>
          }
        </div>

        <!-- Character count -->
        @if (showCount() && maxLength()) {
          <span 
            class="text-xs shrink-0"
            [class.text-text-muted]="!isNearLimit()"
            [class.text-warning-600]="isNearLimit() && !isOverLimit()"
            [class.text-danger-600]="isOverLimit()"
          >
            {{ value().length }} / {{ maxLength() }}
          </span>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  // Inputs
  size = input<TextareaSize>('md');
  label = input<string>('');
  placeholder = input<string>('');
  hint = input<string>('');
  errorMessage = input<string>('');
  hasError = input<boolean>(false);
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  rows = input<number>(4);
  maxLength = input<number | null>(null);
  showCount = input<boolean>(false);
  resize = input<'none' | 'vertical' | 'horizontal' | 'both'>('vertical');

  // State
  value = signal<string>('');
  focused = signal<boolean>(false);

  // Unique ID for accessibility
  textareaId = signal(`textarea-${Math.random().toString(36).substr(2, 9)}`);

  // Outputs
  valueChange = output<string>();
  blurred = output<void>();

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

  // Character count helpers
  isNearLimit(): boolean {
    const max = this.maxLength();
    if (!max) return false;
    return this.value().length >= max * 0.9;
  }

  isOverLimit(): boolean {
    const max = this.maxLength();
    if (!max) return false;
    return this.value().length >= max;
  }

  // Computed textarea classes
  textareaClasses = computed(() => {
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

    const sizeClasses: Record<TextareaSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const stateClasses = this.hasError()
      ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200 dark:border-danger-600'
      : 'border-border-color focus:border-primary-500 focus:ring-primary-200 dark:border-secondary-600';

    const resizeClasses: Record<string, string> = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return [
      baseClasses,
      sizeClasses[this.size()],
      stateClasses,
      resizeClasses[this.resize()],
    ].join(' ');
  });

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
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
  }
}
