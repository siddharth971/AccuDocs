import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewPreferenceService } from '../../services/view-preference.service';
import { VIEW_MODES, ViewMode } from '../../models/file-explorer.models';

@Component({
  selector: 'app-file-view-toolbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './file-view-toolbar.component.html',
  styleUrls: ['./file-view-toolbar.component.scss']
})
export class FileViewToolbarComponent {
  viewModes = VIEW_MODES;
  viewState$ = this.viewService.state$;

  constructor(private viewService: ViewPreferenceService) { }

  getCurrentIcon(mode: ViewMode): string {
    return this.viewModes.find(m => m.value === mode)?.icon || 'view_comfy';
  }

  setView(mode: ViewMode) {
    this.viewService.updateViewMode(mode);
  }

  togglePreview(currentState: boolean) {
    this.viewService.setPreview(!currentState);
  }

  toggleDetails(currentState: boolean) {
    this.viewService.setDetails(!currentState);
  }

  refresh() {
    // Emit refresh event or call service
    console.log('Refresh triggered');
  }

  sort(by: 'name' | 'date' | 'size' | 'type') {
    this.viewService.updateSort(by);
  }
}
