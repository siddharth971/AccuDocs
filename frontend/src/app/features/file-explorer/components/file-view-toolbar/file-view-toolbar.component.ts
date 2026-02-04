import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowPathSolid,
  heroFolderPlusSolid,
  heroArrowUpTraySolid,
  heroArrowLeftSolid,
  heroChevronDownSolid,
  heroArrowsUpDownSolid,
  heroSquares2x2Solid
} from '@ng-icons/heroicons/solid';
import { ButtonComponent } from '@ui/atoms/button.component';
import { ViewPreferenceService } from '../../services/view-preference.service';
import { VIEW_MODES, ViewMode } from '../../models/file-explorer.models';

@Component({
  selector: 'app-file-view-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    NgIconComponent,
    ButtonComponent
  ],
  providers: [
    provideIcons({
      heroArrowPathSolid,
      heroFolderPlusSolid,
      heroArrowUpTraySolid,
      heroArrowLeftSolid,
      heroChevronDownSolid,
      heroArrowsUpDownSolid,
      heroSquares2x2Solid
    })
  ],
  templateUrl: './file-view-toolbar.component.html',
  styleUrls: ['./file-view-toolbar.component.scss']
})
export class FileViewToolbarComponent {
  // Inputs
  canGoBack = input<boolean>(false);

  // Outputs
  refreshClicked = output<void>();
  newFolderClicked = output<void>();
  uploadClicked = output<void>();
  backClicked = output<void>();

  viewModes = VIEW_MODES;
  viewState$ = this.viewService.state$;

  constructor(private viewService: ViewPreferenceService) { }

  getCurrentIcon(mode: ViewMode): string {
    return this.viewModes.find(m => m.value === mode)?.icon || 'view_comfy';
  }

  getCurrentLabel(mode: ViewMode): string {
    return this.viewModes.find(m => m.value === mode)?.label || 'View';
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

  sort(by: 'name' | 'date' | 'size' | 'type') {
    this.viewService.updateSort(by);
  }

  // Action methods to emit
  onRefresh() {
    this.refreshClicked.emit();
  }

  onNewFolder() {
    this.newFolderClicked.emit();
  }

  onUpload() {
    this.uploadClicked.emit();
  }

  onBack() {
    this.backClicked.emit();
  }
}
