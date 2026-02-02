import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import * as heroSolid from '@ng-icons/heroicons/solid';
import * as heroOutline from '@ng-icons/heroicons/outline';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

@Component({
  selector: 'app-icon, ui-icon',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <ng-icon 
      [name]="name()" 
      [size]="iconSize()"
      [class]="className()"
      [attr.aria-hidden]="!ariaLabel() ? 'true' : null"
      [attr.aria-label]="ariaLabel()"
      [attr.role]="ariaLabel() ? 'img' : null"
    ></ng-icon>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      ...heroSolid,
      ...heroOutline,
    }),
  ],
})
export class IconComponent {
  // Inputs
  name = input.required<string>();
  size = input<IconSize>('md');
  className = input<string>('');
  ariaLabel = input<string>('');

  // Size mapping
  iconSize(): string {
    const sizeMap: Record<IconSize, string> = {
      xs: '12',
      sm: '16',
      md: '20',
      lg: '24',
      xl: '32',
      '2xl': '40',
    };
    return sizeMap[this.size()];
  }
}
