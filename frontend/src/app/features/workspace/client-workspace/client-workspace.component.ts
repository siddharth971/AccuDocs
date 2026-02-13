import { Component, inject, signal, computed, effect, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { WorkspaceService, WorkspaceTree, FolderNode, FileNode, Breadcrumb } from '@core/services/workspace.service';
import { ToastService } from '@core/services/toast.service';
import { ButtonComponent } from '@ui/atoms/button.component';
import { CardComponent } from '@ui/molecules/card.component';
import { LoaderComponent } from '@ui/atoms/loader.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroFolderSolid,
  heroFolderOpenSolid,
  heroDocumentSolid,
  heroDocumentTextSolid,
  heroPhotoSolid,
  heroArrowDownTraySolid,
  heroTrashSolid,
  heroPencilSquareSolid,
  heroArrowUpTraySolid,
  heroChevronRightSolid,
  heroHomeSolid,
  heroXMarkSolid,
  heroEyeSolid,
  heroArrowsPointingOutSolid,
  heroTableCellsSolid,
  heroArchiveBoxSolid,
  heroPlusSolid,
  heroArrowPathSolid,
  heroFolderPlusSolid,
  heroEllipsisVerticalSolid
} from '@ng-icons/heroicons/solid';

// File Explorer specific imports
import { FileViewToolbarComponent } from '../../file-explorer/components/file-view-toolbar/file-view-toolbar.component';
import { FileGridComponent } from '../../file-explorer/components/file-grid/file-grid.component';
import { FileListComponent } from '../../file-explorer/components/file-list/file-list.component';
import { FileDetailsComponent } from '../../file-explorer/components/file-details/file-details.component';
import { DetailsPaneComponent } from '../../file-explorer/components/details-pane/details-pane.component';
import { PreviewPaneComponent } from '../../file-explorer/components/preview-pane/preview-pane.component';
import { ViewPreferenceService } from '../../file-explorer/services/view-preference.service';
import { FileItem } from '../../file-explorer/models/file-explorer.models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-client-workspace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    LoaderComponent,
    NgIconComponent,
    FileViewToolbarComponent,
    FileGridComponent,
    FileListComponent,
    FileDetailsComponent,
    DetailsPaneComponent,
    PreviewPaneComponent,
    MatIconModule
  ],
  providers: [
    provideIcons({
      heroFolderSolid,
      heroFolderOpenSolid,
      heroDocumentSolid,
      heroDocumentTextSolid,
      heroPhotoSolid,
      heroArrowDownTraySolid,
      heroTrashSolid,
      heroPencilSquareSolid,
      heroArrowUpTraySolid,
      heroChevronRightSolid,
      heroHomeSolid,
      heroXMarkSolid,
      heroEyeSolid,
      heroArrowsPointingOutSolid,
      heroTableCellsSolid,
      heroArchiveBoxSolid,
      heroPlusSolid,
      heroArrowPathSolid,
      heroFolderPlusSolid,
      heroEllipsisVerticalSolid
    })
  ],
  template: `
    <div class="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input
        #fileInput
        type="file"
        multiple
        class="hidden"
        (change)="onFilesSelected($event)"
      />

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="py-20">
          <app-loader size="lg" label="Loading workspace..."></app-loader>
        </div>
      } @else if (workspace()) {
      <!-- Workspace Path Breadcrumbs -->
      <section class="mb-6">
        <nav class="flex items-center gap-1 py-1 text-sm">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-text-secondary hover:text-primary-600 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
            (click)="navigateToRoot()"
          >
            <ng-icon name="heroHomeSolid" size="16" class="text-primary-500"></ng-icon>
            <span class="tracking-tight uppercase text-[11px]">{{ workspace()?.clientCode }}</span>
          </button>
          
          @for (crumb of breadcrumbs(); track crumb.id; let last = $last) {
            <div class="flex items-center gap-1">
              <ng-icon name="heroChevronRightSolid" size="12" class="text-text-secondary/30"></ng-icon>
              <button
                [class]="last ? 'border-primary-500 text-primary-600 font-bold' : 'border-transparent text-text-secondary hover:text-primary-600 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'"
                class="px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 border"
                (click)="!last && navigateToFolder(crumb.id)"
              >
                @if (last) {
                  <div class="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                }
                {{ crumb.name }}
              </button>
            </div>
          }
        </nav>
      </section>

      <!-- Main Content Grid -->
      <div class="flex-1 grid grid-cols-12 gap-6 items-stretch min-h-0">
          <!-- Folder Tree Sidebar -->
          <aside class="col-span-12 lg:col-span-3 flex flex-col min-h-0">
            <app-card [padding]="false" [fullHeight]="true" class="flex-1 flex flex-col min-h-0">
              <div class="shrink-0 p-4 border-b border-border-color bg-gray-50/50">
                <h3 class="font-semibold text-text-primary flex items-center gap-2">
                  <ng-icon name="heroFolderSolid" size="18" class="text-primary-600"></ng-icon>
                  Folder Structure
                </h3>
              </div>
              <div class="flex-1 p-2 overflow-y-auto custom-scrollbar">
                @if (workspace()?.rootFolder) {
                  <ng-container *ngTemplateOutlet="folderTree; context: { folder: workspace()!.rootFolder, level: 0 }"></ng-container>
                }
              </div>
            </app-card>
          </aside>

          <!-- File Explorer Main Area -->
          <main [class]="(viewState$ | async)?.showPreview || (viewState$ | async)?.showDetails ? 'col-span-12 lg:col-span-6' : 'col-span-12 lg:col-span-9'" class="flex flex-col min-h-0">
            <app-card [padding]="false" [fullHeight]="true" class="flex-1 flex flex-col min-h-0">
              <!-- Toolbar Integration -->
              <div class="border-b border-border-color">
                <app-file-view-toolbar 
                  [canGoBack]="breadcrumbs().length > 0"
                  (refreshClicked)="refresh()"
                  (newFolderClicked)="triggerFolderCreate()"
                  (uploadClicked)="triggerUpload()"
                  (backClicked)="goBack()">
                </app-file-view-toolbar>
              </div>

              <!-- Folder Header -->
              <div class="p-4 border-b border-border-color bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                      <ng-icon name="heroFolderOpenSolid" size="24" class="text-primary-600"></ng-icon>
                    </div>
                    <div>
                      <h2 class="text-xl font-bold text-text-primary">{{ currentFolder()?.name || 'Root' }}</h2>
                      <p class="text-sm text-text-secondary">
                        {{ currentFolder()?.fileCount || 0 }} files
                        @if (currentFolder()?.folderCount || currentFolder()?.children?.length) {
                          · {{ currentFolder()?.folderCount || currentFolder()?.children?.length }} folders
                        }
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-text-secondary">
                      {{ formatTotalSize(currentFolder()?.totalSize || 0) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Upload Progress -->
              @if (uploadProgress() > 0 && uploadProgress() < 100) {
                <div class="p-4 bg-primary-50 dark:bg-primary-900/20 border-b border-border-color">
                  <div class="flex items-center gap-3">
                    <div class="flex-1">
                      <div class="flex justify-between text-sm mb-1">
                        <span class="font-medium text-text-primary">Uploading...</span>
                        <span class="text-text-secondary">{{ uploadProgress() }}%</span>
                      </div>
                      <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
                          [style.width.%]="uploadProgress()"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- View Content Area -->
              <div class="flex-1 overflow-auto bg-white/50 dark:bg-gray-800/50" [ngSwitch]="(viewState$ | async)?.viewMode">
                @if (fileItems().length > 0) {
                  <!-- Grid Views (Extra Large, Large, Medium, Small) -->
                  <app-file-grid
                    *ngSwitchCase="'extra-large'"
                    [files]="fileItems()"
                    viewMode="extra-large"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                    (fileRenamed)="onFileRenamed($event)"
                    (filePreviewed)="onFilePreviewed($event)"
                    (fileDownloaded)="onFileDownloaded($event)"
                    (fileDeleted)="onFileDeleted($event)"
                  ></app-file-grid>
                  <app-file-grid
                    *ngSwitchCase="'large'"
                    [files]="fileItems()"
                    viewMode="large"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                    (fileRenamed)="onFileRenamed($event)"
                    (filePreviewed)="onFilePreviewed($event)"
                    (fileDownloaded)="onFileDownloaded($event)"
                    (fileDeleted)="onFileDeleted($event)"
                  ></app-file-grid>
                  <app-file-grid
                    *ngSwitchCase="'medium'"
                    [files]="fileItems()"
                    viewMode="medium"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                    (fileRenamed)="onFileRenamed($event)"
                    (filePreviewed)="onFilePreviewed($event)"
                    (fileDownloaded)="onFileDownloaded($event)"
                    (fileDeleted)="onFileDeleted($event)"
                  ></app-file-grid>
                  <app-file-grid
                    *ngSwitchCase="'small'"
                    [files]="fileItems()"
                    viewMode="small"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                    (fileRenamed)="onFileRenamed($event)"
                    (filePreviewed)="onFilePreviewed($event)"
                    (fileDownloaded)="onFileDownloaded($event)"
                    (fileDeleted)="onFileDeleted($event)"
                  ></app-file-grid>

                  <!-- List View -->
                  <app-file-list
                    *ngSwitchCase="'list'"
                    [files]="fileItems()"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                  ></app-file-list>

                  <!-- Details View -->
                  <app-file-details
                    *ngSwitchCase="'details'"
                    [files]="fileItems()"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                  ></app-file-details>

                  <!-- Tiles & Content (Mapped to Grid for now) -->
                  <app-file-grid
                    *ngSwitchCase="'tiles'"
                    [files]="fileItems()"
                    viewMode="medium"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                    (fileRenamed)="onFileRenamed($event)"
                    (filePreviewed)="onFilePreviewed($event)"
                    (fileDownloaded)="onFileDownloaded($event)"
                    (fileDeleted)="onFileDeleted($event)"
                  ></app-file-grid>
                  <app-file-grid
                    *ngSwitchCase="'content'"
                    [files]="fileItems()"
                    viewMode="large"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                    (fileRenamed)="onFileRenamed($event)"
                    (filePreviewed)="onFilePreviewed($event)"
                    (fileDownloaded)="onFileDownloaded($event)"
                    (fileDeleted)="onFileDeleted($event)"
                  ></app-file-grid>
                } @else {
                  <!-- Empty State -->
                  <div class="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                    <mat-icon class="text-6xl h-24 w-24 mb-4 text-gray-300">folder_open</mat-icon>
                    <h3 class="text-xl font-medium mb-2">This folder is empty</h3>
                    <p class="text-sm max-w-xs text-text-secondary mb-6">
                      Drag and drop files here to upload or use the upload button above.
                    </p>
                    <app-button variant="primary" size="md" (clicked)="triggerUpload()">
                      <ng-icon name="heroArrowUpTraySolid" class="mr-2" size="18"></ng-icon>
                      Upload Files
                    </app-button>
                  </div>
                }
              </div>

              <!-- Status Bar -->
              <footer class="px-4 py-2 bg-gray-50 border-t border-border-color flex items-center justify-between text-xs text-text-secondary select-none">
                <div class="flex items-center gap-4">
                  <span>{{ fileItems().length }} items</span>
                  @if (selectedFile()) {
                    <span class="text-primary-600 font-medium">1 item selected</span>
                  }
                </div>
                <div class="flex items-center gap-3">
                  <button class="hover:text-primary-600 transition-colors" title="List View" (click)="viewService.updateViewMode('list')">
                    <mat-icon class="text-lg h-5 w-5">view_list</mat-icon>
                  </button>
                  <button class="hover:text-primary-600 transition-colors" title="Details View" (click)="viewService.updateViewMode('details')">
                    <mat-icon class="text-lg h-5 w-5">view_headline</mat-icon>
                  </button>
                  <div class="w-px h-3 bg-gray-300 mx-1"></div>
                  <button class="hover:text-primary-600 transition-colors" title="Grid View" (click)="viewService.updateViewMode('large')">
                    <mat-icon class="text-lg h-5 w-5">grid_view</mat-icon>
                  </button>
                </div>
              </footer>
            </app-card>
          </main>

          <!-- Side Panes -->
          @if ((viewState$ | async)?.showPreview) {
            <aside class="col-span-12 lg:col-span-3 transition-all duration-300 animate-in slide-in-from-right-4">
              <app-card [padding]="false" class="h-full">
                <app-preview-pane [selectedFile]="selectedFile()"></app-preview-pane>
              </app-card>
            </aside>
          }

          @if ((viewState$ | async)?.showDetails) {
            <aside class="col-span-12 lg:col-span-3 transition-all duration-300 animate-in slide-in-from-right-4">
              <app-card [padding]="false" class="h-full">
                <app-details-pane [selectedFile]="selectedFile()"></app-details-pane>
              </app-card>
            </aside>
          }
        </div>
      }

      <!-- Rename Modal -->
      @if (showRenameModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-md z-modal-backdrop flex items-center justify-center p-4" (click)="closeRenameModal()">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-border-color">
              <h3 class="text-lg font-bold text-text-primary">Rename File</h3>
            </div>
            <div class="p-6">
              <input
                type="text"
                [(ngModel)]="newFileName"
                class="form-input"
                placeholder="Enter new file name"
                (keyup.enter)="confirmRename()"
              />
            </div>
            <div class="p-6 border-t border-border-color flex justify-end gap-3">
              <app-button variant="secondary" size="md" (clicked)="closeRenameModal()">Cancel</app-button>
              <app-button variant="primary" size="md" (clicked)="confirmRename()">Rename</app-button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-md z-modal-backdrop flex items-center justify-center p-4" (click)="closeDeleteModal()">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-border-color">
              <h3 class="text-lg font-bold text-text-primary">Delete File</h3>
            </div>
            <div class="p-6">
              <p class="text-text-secondary">
                Are you sure you want to delete <strong class="text-text-primary">{{ fileToDelete()?.originalName }}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div class="p-6 border-t border-border-color flex justify-end gap-3">
              <app-button variant="secondary" size="md" (clicked)="closeDeleteModal()">Cancel</app-button>
              <app-button variant="danger" size="md" (clicked)="confirmDelete()">Delete</app-button>
            </div>
          </div>
        </div>
      }

      <!-- Preview Modal -->
      @if (showPreviewModal()) {
        <div class="fixed inset-0 bg-black/90 z-modal-backdrop flex flex-col" (click)="closePreviewModal()">
          <div class="flex items-center justify-between p-4 text-white">
            <div class="flex items-center gap-3">
              <ng-icon [name]="isPdf(fileToPreview()?.mimeType || '') ? 'heroDocumentTextSolid' : 'heroPhotoSolid'" size="24"></ng-icon>
              <span class="font-medium">{{ fileToPreview()?.originalName }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button class="p-2 hover:bg-white/10 rounded-lg transition-colors" (click)="downloadFile(fileToPreview()!)">
                <ng-icon name="heroArrowDownTraySolid" size="20"></ng-icon>
              </button>
              <button class="p-2 hover:bg-white/10 rounded-lg transition-colors" (click)="closePreviewModal(); $event.stopPropagation()">
                <ng-icon name="heroXMarkSolid" size="24"></ng-icon>
              </button>
            </div>
          </div>
          <div class="flex-1 flex items-center justify-center p-4" (click)="$event.stopPropagation()">
            @if (previewUrl()) {
              @if (isImage(fileToPreview()?.mimeType || '')) {
                <img [src]="previewUrl()" [alt]="fileToPreview()?.originalName" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              } @else if (isPdf(fileToPreview()?.mimeType || '')) {
                <iframe [src]="previewUrl()" class="w-full h-full max-w-4xl rounded-lg shadow-2xl bg-white"></iframe>
              }
            } @else {
              <app-loader size="lg" label="Loading preview..."></app-loader>
            }
          </div>
        </div>
      }

      <!-- Folder Create/Rename Modal -->
      @if (showFolderModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-md z-modal-backdrop flex items-center justify-center p-4" (click)="closeFolderModal()">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-border-color">
              <h3 class="text-lg font-bold text-text-primary">
                {{ folderModalMode() === 'create' ? 'Create New Folder' : 'Rename Folder' }}
              </h3>
            </div>
            <div class="p-6">
              <label class="block text-sm font-medium text-text-secondary mb-2">Folder Name</label>
              <input
                type="text"
                [(ngModel)]="newFolderName"
                class="w-full px-4 py-2 rounded-xl border border-border-color bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                placeholder="Enter folder name"
                (keyup.enter)="confirmFolderAction()"
                autofocus
              />
            </div>
            <div class="p-6 border-t border-border-color flex justify-end gap-3">
              <app-button variant="secondary" size="md" (clicked)="closeFolderModal()">Cancel</app-button>
              <app-button variant="primary" size="md" (clicked)="confirmFolderAction()" [disabled]="!newFolderName.trim()">
                {{ folderModalMode() === 'create' ? 'Create' : 'Rename' }}
              </app-button>
            </div>
          </div>
        </div>
      }

      <!-- Folder Delete Confirmation Modal -->
      @if (showFolderDeleteModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-md z-modal-backdrop flex items-center justify-center p-4" (click)="closeFolderDeleteModal()">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-border-color">
              <h3 class="text-lg font-bold text-text-primary">Delete Folder</h3>
            </div>
            <div class="p-6">
              <p class="text-text-secondary">
                Are you sure you want to delete <strong class="text-text-primary">{{ folderToDelete()?.name }}</strong>?
                All files and subfolders within it must be deleted first.
              </p>
            </div>
            <div class="p-6 border-t border-border-color flex justify-end gap-3">
              <app-button variant="secondary" size="md" (clicked)="closeFolderDeleteModal()">Cancel</app-button>
              <app-button variant="danger" size="md" (clicked)="confirmFolderDelete()">Delete</app-button>
            </div>
          </div>
        </div>
      }

      <!-- Folder Tree Template -->
      <ng-template #folderTree let-folder="folder" let-level="level">
        <div [style.paddingLeft.px]="level * 12">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group/folder"
            [class]="currentFolder()?.id === folder.id ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-primary'"
            (click)="navigateToFolder(folder.id)"
          >
            <ng-icon
              [name]="currentFolder()?.id === folder.id ? 'heroFolderOpenSolid' : 'heroFolderSolid'"
              size="16"
              [class]="folder.type === 'year' ? 'text-blue-500' : folder.type === 'documents' ? 'text-green-500' : folder.type === 'years' ? 'text-purple-500' : 'text-amber-500'"
            ></ng-icon>
            <span class="truncate flex-1 text-left">{{ folder.name }}</span>
            @if (folder.fileCount > 0) {
              <span class="text-xs bg-gray-200 dark:bg-gray-700 text-text-secondary px-1.5 py-0.5 rounded">
                {{ folder.fileCount }}
              </span>
            } @else if (folder.children?.length) {
              <span class="text-xs bg-gray-100 dark:bg-gray-800 text-text-secondary/70 px-1.5 py-0.5 rounded border border-border-color">
                {{ folder.children.length }}
              </span>
            }

            <!-- Inline Folder Actions -->
            @if (!['root', 'documents', 'years', 'year'].includes(folder.type)) {
              <div class="flex items-center opacity-0 group-hover/folder:opacity-100 transition-opacity ml-1">
                <button 
                  class="p-1 hover:text-primary-600 transition-colors" 
                  (click)="triggerFolderRename(folder); $event.stopPropagation()"
                  title="Rename"
                >
                  <ng-icon name="heroPencilSquareSolid" size="12"></ng-icon>
                </button>
                <button 
                  class="p-1 hover:text-red-500 transition-colors" 
                  (click)="triggerFolderDelete(folder); $event.stopPropagation()"
                  title="Delete"
                >
                  <ng-icon name="heroTrashSolid" size="12"></ng-icon>
                </button>
              </div>
            }
          </button>
          @if (folder.children.length) {
            @for (child of folder.children; track child.id) {
              <ng-container *ngTemplateOutlet="folderTree; context: { folder: child, level: level + 1 }"></ng-container>
            }
          }
        </div>
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientWorkspaceComponent implements OnInit, OnDestroy {
  // Remove duplicate ngOnInit

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workspaceService = inject(WorkspaceService);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  public viewService = inject(ViewPreferenceService);
  private destroy$ = new Subject<void>();

  // View state
  viewState$ = this.viewService.state$;
  selectedFile = signal<FileItem | null>(null);

  // File items computed from current folder
  fileItems = computed<FileItem[]>(() => {
    const current = this.currentFolder();
    if (!current) return [];

    const folders: FileItem[] = (current.children || []).map(f => ({
      id: f.id,
      name: f.name,
      type: 'folder',
      modifiedDate: new Date(),
      createdDate: new Date(),
      owner: 'System',
      path: f.slug || ''
    }));

    const files: FileItem[] = (current.files || []).map(f => ({
      id: f.id,
      name: f.originalName,
      type: this.getFileType(f.mimeType),
      size: f.size,
      modifiedDate: new Date(f.createdAt),
      createdDate: new Date(f.createdAt),
      owner: f.uploadedBy?.name || 'System',
      path: f.s3Path || '',
      thumbnailUrl: this.thumbnails()[f.id]
    }));

    return [...folders, ...files];
  });

  private getFileType(mime: string): 'pdf' | 'image' | 'text' | 'unknown' {
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('image')) return 'image';
    if (mime.includes('text') || mime.includes('plain')) return 'text';
    return 'unknown';
  }

  onFileSelected(file: FileItem) {
    this.selectedFile.set(file);
  }

  onFileOpened(file: FileItem) {
    if (file.type === 'folder') {
      this.navigateToFolder(file.id);
    } else {
      // Find the FileNode to use existing preview logic
      const fileNode = this.currentFolder()?.files.find(f => f.id === file.id);
      if (fileNode) {
        this.previewFile(fileNode);
      }
    }
  }

  onFileRenamed(event: { file: FileItem, newName: string }) {
    console.log('Workspace: onFileRenamed called for', event.file.name, 'new name:', event.newName);
    const fileNode = this.currentFolder()?.files.find(f => f.id === event.file.id);
    if (fileNode && event.newName) {
      // Directly call rename API with new name
      this.workspaceService.renameFile(fileNode.id, event.newName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toast.success('File renamed successfully');
            // Refresh current folder
            this.navigateToFolder(this.currentFolder()!.id);
          },
          error: (error) => {
            this.toast.error('Rename failed', error.message);
          }
        });
    }
  }

  onFilePreviewed(file: FileItem) {
    console.log('Workspace: onFilePreviewed called for', file.name);
    if (file.type === 'folder') return;

    const fileNode = this.currentFolder()?.files.find(f => f.id === file.id);
    if (fileNode) {
      this.previewFile(fileNode);
    }
  }

  onFileDownloaded(file: FileItem) {
    console.log('Workspace: onFileDownloaded called for', file.name);
    const fileNode = this.currentFolder()?.files.find(f => f.id === file.id);
    if (fileNode) {
      this.downloadFile(fileNode);
    }
  }

  onFileDeleted(file: FileItem) {
    console.log('Workspace: onFileDeleted called for', file.name);
    const fileNode = this.currentFolder()?.files.find(f => f.id === file.id);
    if (fileNode) {
      this.deleteFile(fileNode);
    }
  }

  // State
  workspace = signal<WorkspaceTree | null>(null);
  currentFolder = signal<FolderNode | null>(null);
  breadcrumbs = signal<Breadcrumb[]>([]);
  isLoading = signal(true);
  uploadProgress = signal(0);
  thumbnails = signal<Record<string, SafeResourceUrl>>({}); // Store thumbnails using SafeResourceUrl

  // File Action States
  showRenameModal = signal(false);
  showDeleteModal = signal(false);
  showPreviewModal = signal(false);
  fileToRename = signal<FileNode | null>(null);
  fileToDelete = signal<FileNode | null>(null);
  fileToPreview = signal<FileNode | null>(null);
  newFileName = '';
  previewUrl = signal<SafeResourceUrl | null>(null);

  // ... (rest of state)


  // Folder modal states
  showFolderModal = signal(false);
  showFolderDeleteModal = signal(false);
  folderModalMode = signal<'create' | 'rename'>('create');
  folderToRename = signal<FolderNode | null>(null);
  folderToDelete = signal<FolderNode | null>(null);
  newFolderName = '';

  // Modal states aggregation for overflow control
  private isAnyModalOpen = computed(() =>
    this.showRenameModal() ||
    this.showDeleteModal() ||
    this.showPreviewModal() ||
    this.showFolderModal() ||
    this.showFolderDeleteModal()
  );

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        if (this.isAnyModalOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  ngOnInit() {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    if (clientId) {
      this.loadWorkspace(clientId);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkspace(clientId: string) {
    this.isLoading.set(true);
    this.workspaceService.getClientWorkspace(clientId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.workspace.set(response.data);
          this.currentFolder.set(response.data.rootFolder);
          this.breadcrumbs.set([]);
          if (response.data.rootFolder.files) {
            this.loadThumbnails(response.data.rootFolder.files);
          }
        },
        error: (error) => {
          this.toast.error('Failed to load workspace', error.message);
        }
      });
  }

  refresh() {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    if (clientId) {
      this.loadWorkspace(clientId);
    }
  }

  navigateToRoot() {
    if (this.workspace()) {
      const root = this.workspace()!.rootFolder;
      this.currentFolder.set(root);
      this.breadcrumbs.set([]);
      if (root.files) {
        this.loadThumbnails(root.files);
      }
    }
  }

  navigateToFolder(folderId: string) {
    // If it's the root folder, use the cached workspace data to avoid API call
    if (this.workspace()?.rootFolder.id === folderId) {
      this.navigateToRoot();
      return;
    }

    // Immediate UI update if folder is found in existing tree
    if (this.workspace()) {
      const folderInTree = this.findFolderInTree(this.workspace()!.rootFolder, folderId);
      if (folderInTree) {
        this.currentFolder.set(folderInTree);
        if (folderInTree.files) {
          this.loadThumbnails(folderInTree.files);
        }
      }
    }

    this.workspaceService.getFolderContents(folderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const folder = response.data.folder;
          const current = this.currentFolder();

          // Sticky subfolders: If API returns empty list but we already have subfolders in local state, preserve them
          if (current && current.id === folder.id && (!folder.children || folder.children.length === 0) && current.children?.length > 0) {
            folder.children = current.children;
            folder.folderCount = current.children.length;
          }

          this.currentFolder.set(folder);
          this.breadcrumbs.set(response.data.breadcrumbs.slice(1)); // Remove root from breadcrumbs

          if (folder.files) {
            this.loadThumbnails(folder.files);
          }
        },
        error: (error) => {
          this.toast.error('Failed to load folder', error.message);
        }
      });
  }

  goBack() {
    const crumbs = this.breadcrumbs();
    if (crumbs.length > 0) {
      if (crumbs.length === 1) {
        this.navigateToRoot();
      } else {
        const parentFolderId = crumbs[crumbs.length - 2].id;
        this.navigateToFolder(parentFolderId);
      }
    }
  }

  triggerUpload() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length || !this.currentFolder()) return;

    const folderId = this.currentFolder()!.id;

    Array.from(files).forEach(file => {
      this.uploadProgress.set(0);
      this.workspaceService.uploadFile(folderId, file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
            } else if (event.type === HttpEventType.Response) {
              this.uploadProgress.set(100);
              this.toast.success('File uploaded successfully');
              this.navigateToFolder(folderId);
              setTimeout(() => this.uploadProgress.set(0), 1000);
            }
          },
          error: (error) => {
            this.uploadProgress.set(0);
            this.toast.error('Upload failed', error.error?.message || error.message);
          }
        });
    });

    input.value = '';
  }

  downloadFile(file: FileNode) {
    this.workspaceService.getFileDownloadUrl(file.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.workspaceService.downloadFile(response.data.url, response.data.fileName);
        },
        error: (error) => {
          this.toast.error('Download failed', error.message);
        }
      });
  }

  renameFile(file: FileNode) {
    this.fileToRename.set(file);
    this.newFileName = file.originalName;
    this.showRenameModal.set(true);
  }

  closeRenameModal() {
    this.showRenameModal.set(false);
    this.fileToRename.set(null);
    this.newFileName = '';
  }

  confirmRename() {
    const file = this.fileToRename();
    if (!file || !this.newFileName.trim()) return;

    this.workspaceService.renameFile(file.id, this.newFileName.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('File renamed successfully');
          this.closeRenameModal();
          if (this.currentFolder()) {
            this.navigateToFolder(this.currentFolder()!.id);
          }
        },
        error: (error) => {
          this.toast.error('Rename failed', error.error?.message || error.message);
        }
      });
  }

  deleteFile(file: FileNode) {
    this.fileToDelete.set(file);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.fileToDelete.set(null);
  }

  confirmDelete() {
    const file = this.fileToDelete();
    if (!file) return;

    this.workspaceService.deleteFile(file.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('File deleted successfully');
          this.closeDeleteModal();
          if (this.currentFolder()) {
            this.navigateToFolder(this.currentFolder()!.id);
          }
        },
        error: (error) => {
          this.toast.error('Delete failed', error.error?.message || error.message);
        }
      });
  }

  previewFile(file: FileNode) {
    this.fileToPreview.set(file);
    this.previewUrl.set(null);
    this.showPreviewModal.set(true);

    this.workspaceService.getFileDownloadUrl(file.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Sanitize the URL to allow it to be used in an iframe
          const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.data.url);
          this.previewUrl.set(safeUrl);
        },
        error: (error) => {
          this.toast.error('Failed to load preview', error.message);
          this.closePreviewModal();
        }
      });
  }

  closePreviewModal() {
    this.showPreviewModal.set(false);
    this.fileToPreview.set(null);
    this.previewUrl.set(null);
  }

  formatFileSize(bytes: number): string {
    return this.workspaceService.formatFileSize(bytes);
  }

  formatTotalSize(bytes: number): string {
    return this.workspaceService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Folder CRUD
  triggerFolderCreate() {
    this.folderModalMode.set('create');
    this.newFolderName = '';
    this.showFolderModal.set(true);
  }

  triggerFolderRename(folder: FolderNode) {
    this.folderModalMode.set('rename');
    this.folderToRename.set(folder);
    this.newFolderName = folder.name;
    this.showFolderModal.set(true);
  }

  triggerFolderDelete(folder: FolderNode) {
    this.folderToDelete.set(folder);
    this.showFolderDeleteModal.set(true);
  }

  closeFolderModal() {
    this.showFolderModal.set(false);
    this.folderToRename.set(null);
    this.newFolderName = '';
  }

  closeFolderDeleteModal() {
    this.showFolderDeleteModal.set(false);
    this.folderToDelete.set(null);
  }

  confirmFolderAction() {
    if (!this.newFolderName.trim()) return;

    if (this.folderModalMode() === 'create') {
      const parentId = this.currentFolder()?.id;
      if (!parentId) return;

      this.workspaceService.createFolder(parentId, this.newFolderName.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toast.success('Folder created successfully');
            this.closeFolderModal();
            this.refresh();
          },
          error: (error) => {
            this.toast.error('Failed to create folder', error.error?.message || error.message);
          }
        });
    } else {
      const folder = this.folderToRename();
      if (!folder) return;

      this.workspaceService.renameFolder(folder.id, this.newFolderName.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toast.success('Folder renamed successfully');
            this.closeFolderModal();
            this.refresh();
          },
          error: (error) => {
            this.toast.error('Failed to rename folder', error.error?.message || error.message);
          }
        });
    }

  }

  loadThumbnails(files: FileNode[]) {
    files.forEach(file => {
      // Only load thumbnails for images that don't have one yet
      if (this.isImage(file.mimeType) && !this.thumbnails()[file.id]) {
        this.workspaceService.getFileDownloadUrl(file.id, true) // Pass true for preview mode (skip log)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.data.url);
              this.thumbnails.update(prev => ({ ...prev, [file.id]: safeUrl }));
            },
            error: () => {
              // Silently fail for thumbnails
            }
          });
      }
    });
  }

  confirmFolderDelete() {
    const folder = this.folderToDelete();
    if (!folder) return;

    this.workspaceService.deleteFolder(folder.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Folder deleted successfully');
          this.closeFolderDeleteModal();
          this.refresh();
        },
        error: (error) => {
          this.toast.error('Failed to delete folder', error.error?.message || error.message);
        }
      });
  }

  isImage(mimeType: string): boolean {
    return mimeType?.includes('image') || false;
  }

  isPdf(mimeType: string): boolean {
    return mimeType?.includes('pdf') || false;
  }

  private findFolderInTree(node: FolderNode, id: string): FolderNode | null {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = this.findFolderInTree(child, id);
      if (found) return found;
    }
    return null;
  }
}
