import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-option',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<div>User Option - This component is no longer in use</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOptionComponent {
}



