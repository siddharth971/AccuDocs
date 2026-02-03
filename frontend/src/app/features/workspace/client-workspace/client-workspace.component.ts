import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
  heroArrowPathSolid
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-client-workspace',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonComponent,
    CardComponent,
    LoaderComponent,
    NgIconComponent
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
      heroArrowPathSolid
    })
  ],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Header Section -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <a routerLink="/clients" class="hover:text-primary-600 transition-colors">Clients</a>
            <ng-icon name="heroChevronRightSolid" size="14"></ng-icon>
            <span class="text-text-primary font-medium">{{ workspace()?.clientCode }} - {{ workspace()?.clientName }}</span>
          </div>
          <h1 class="text-3xl font-bold text-text-primary tracking-tight">Document Workspace</h1>
          <p class="text-text-secondary mt-1">Manage files and documents for this client</p>
        </div>
        <div class="flex items-center gap-3">
          <app-button variant="secondary" size="md" (clicked)="refresh()">
            <ng-icon name="heroArrowPathSolid" class="mr-2" size="18"></ng-icon>
            Refresh
          </app-button>
          <app-button variant="primary" size="md" (clicked)="triggerUpload()">
            <ng-icon name="heroArrowUpTraySolid" class="mr-2" size="18"></ng-icon>
            Upload Files
          </app-button>
          <input
            #fileInput
            type="file"
            multiple
            class="hidden"
            (change)="onFilesSelected($event)"
          />
        </div>
      </header>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="py-20">
          <app-loader size="lg" label="Loading workspace..."></app-loader>
        </div>
      } @else if (workspace()) {
        <!-- Breadcrumb Navigation -->
        <nav class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 border border-border-color">
          <button
            class="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors"
            (click)="navigateToRoot()"
          >
            <ng-icon name="heroHomeSolid" size="16"></ng-icon>
            <span>{{ workspace()?.clientCode }}</span>
          </button>
          @for (crumb of breadcrumbs(); track crumb.id; let last = $last) {
            <ng-icon name="heroChevronRightSolid" size="14" class="text-text-secondary/50"></ng-icon>
            <button
              [class]="last ? 'text-primary-600 font-semibold' : 'text-text-secondary hover:text-primary-600'"
              class="text-sm transition-colors"
              (click)="navigateToFolder(crumb.id)"
            >
              {{ crumb.name }}
            </button>
          }
        </nav>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Folder Tree Sidebar -->
          <aside class="col-span-12 lg:col-span-3">
            <app-card [padding]="false" class="sticky top-24">
              <div class="p-4 border-b border-border-color bg-gray-50/50">
                <h3 class="font-semibold text-text-primary flex items-center gap-2">
                  <ng-icon name="heroFolderSolid" size="18" class="text-primary-600"></ng-icon>
                  Folder Structure
                </h3>
              </div>
              <div class="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                @if (workspace()?.rootFolder) {
                  <ng-container *ngTemplateOutlet="folderTree; context: { folder: workspace()!.rootFolder, level: 0 }"></ng-container>
                }
              </div>
            </app-card>
          </aside>

          <!-- File Explorer Main Area -->
          <main class="col-span-12 lg:col-span-9">
            <app-card [padding]="false">
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

              <!-- Subfolders -->
              @if (currentFolder()?.children?.length) {
                <div class="p-4 border-b border-border-color">
                  <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Folders</h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    @for (folder of currentFolder()?.children; track folder.id) {
                      <button
                        class="flex items-center gap-3 p-3 rounded-xl border border-border-color hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all group cursor-pointer"
                        (click)="navigateToFolder(folder.id)"
                      >
                        <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors">
                          <ng-icon name="heroFolderSolid" size="20" class="text-amber-600"></ng-icon>
                        </div>
                        <div class="text-left overflow-hidden">
                          <p class="font-medium text-text-primary truncate">{{ folder.name }}</p>
                          <p class="text-xs text-text-secondary">
                            {{ folder.fileCount }} files
                            @if (folder.children.length) {
                              · {{ folder.children.length }} folders
                            }
                          </p>
                        </div>
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Files Grid -->
              <div class="p-4">
                @if (currentFolder()?.files?.length) {
                  <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Files</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @for (file of currentFolder()?.files; track file.id) {
                      <div class="group relative bg-white dark:bg-gray-800 border border-border-color rounded-xl hover:border-primary-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                        <!-- File Thumbnail/Icon -->
                        <div class="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative">
                          @if (isImage(file.mimeType)) {
                            <div class="absolute inset-0 flex items-center justify-center">
                              <ng-icon name="heroPhotoSolid" size="48" class="text-blue-400"></ng-icon>
                            </div>
                          } @else if (isPdf(file.mimeType)) {
                            <div class="absolute inset-0 flex items-center justify-center">
                              <ng-icon name="heroDocumentTextSolid" size="48" class="text-red-500"></ng-icon>
                            </div>
                          } @else {
                            <div class="absolute inset-0 flex items-center justify-center">
                              <ng-icon name="heroDocumentSolid" size="48" class="text-gray-400"></ng-icon>
                            </div>
                          }
                          
                          <!-- Hover Actions Overlay -->
                          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            @if (isPdf(file.mimeType) || isImage(file.mimeType)) {
                              <button
                                class="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                                title="Preview"
                                (click)="previewFile(file)"
                              >
                                <ng-icon name="heroEyeSolid" size="20" class="text-white"></ng-icon>
                              </button>
                            }
                            <button
                              class="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                              title="Download"
                              (click)="downloadFile(file)"
                            >
                              <ng-icon name="heroArrowDownTraySolid" size="20" class="text-white"></ng-icon>
                            </button>
                            <button
                              class="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                              title="Rename"
                              (click)="renameFile(file)"
                            >
                              <ng-icon name="heroPencilSquareSolid" size="20" class="text-white"></ng-icon>
                            </button>
                            <button
                              class="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg backdrop-blur-sm transition-colors"
                              title="Delete"
                              (click)="deleteFile(file)"
                            >
                              <ng-icon name="heroTrashSolid" size="20" class="text-white"></ng-icon>
                            </button>
                          </div>
                        </div>
                        
                        <!-- File Info -->
                        <div class="p-3">
                          <p class="font-medium text-text-primary truncate text-sm" [title]="file.originalName">
                            {{ file.originalName }}
                          </p>
                          <div class="flex items-center justify-between mt-1">
                            <span class="text-xs text-text-secondary">{{ formatFileSize(file.size) }}</span>
                            <span class="text-xs text-text-secondary">{{ formatDate(file.createdAt) }}</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                } @else if (!currentFolder()?.children?.length && !currentFolder()?.folderCount) {
                  <!-- Empty State -->
                  <div class="text-center py-16">
                    <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ng-icon name="heroFolderSolid" size="32" class="text-gray-400"></ng-icon>
                    </div>
                    <h3 class="text-lg font-semibold text-text-primary mb-2">No files yet</h3>
                    <p class="text-text-secondary mb-6">Upload files to get started</p>
                    <app-button variant="primary" size="md" (clicked)="triggerUpload()">
                      <ng-icon name="heroArrowUpTraySolid" class="mr-2" size="18"></ng-icon>
                      Upload Files
                    </app-button>
                  </div>
                }
              </div>
            </app-card>
          </main>
        </div>
      }

      <!-- Rename Modal -->
      @if (showRenameModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeRenameModal()">
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
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeDeleteModal()">
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
        <div class="fixed inset-0 bg-black/90 z-50 flex flex-col" (click)="closePreviewModal()">
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

      <!-- Folder Tree Template -->
      <ng-template #folderTree let-folder="folder" let-level="level">
        <div [style.paddingLeft.px]="level * 12">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
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
            } @else if (folder.children.length) {
              <span class="text-xs bg-gray-100 dark:bg-gray-800 text-text-secondary/70 px-1.5 py-0.5 rounded border border-border-color">
                {{ folder.children.length }}
              </span>
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workspaceService = inject(WorkspaceService);
  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();

  // State
  workspace = signal<WorkspaceTree | null>(null);
  currentFolder = signal<FolderNode | null>(null);
  breadcrumbs = signal<Breadcrumb[]>([]);
  isLoading = signal(true);
  uploadProgress = signal(0);

  // Modal states
  showRenameModal = signal(false);
  showDeleteModal = signal(false);
  showPreviewModal = signal(false);
  fileToRename = signal<FileNode | null>(null);
  fileToDelete = signal<FileNode | null>(null);
  fileToPreview = signal<FileNode | null>(null);
  newFileName = '';
  previewUrl = signal<string | null>(null);

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
      this.currentFolder.set(this.workspace()!.rootFolder);
      this.breadcrumbs.set([]);
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
        },
        error: (error) => {
          this.toast.error('Failed to load folder', error.message);
        }
      });
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
          this.previewUrl.set(response.data.url);
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
