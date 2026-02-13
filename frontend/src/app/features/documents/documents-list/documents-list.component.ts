import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { WorkspaceService, FileWithClientInfo, FileNode, FolderNode, Breadcrumb, WorkspaceTree } from '@core/services/workspace.service';
import { ClientService, Client } from '@core/services/client.service';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';
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
  heroXMarkSolid,
  heroEyeSolid,
  heroTableCellsSolid,
  heroArchiveBoxSolid,
  heroArrowPathSolid,
  heroMagnifyingGlassSolid,
  heroUserGroupSolid,
  heroChevronRightSolid,
  heroChevronDownSolid,
  heroHomeSolid
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
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-documents-list',
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
    MatIconModule,
    MatSelectModule
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
      heroXMarkSolid,
      heroEyeSolid,
      heroTableCellsSolid,
      heroArchiveBoxSolid,
      heroArrowPathSolid,
      heroMagnifyingGlassSolid,
      heroUserGroupSolid,
      heroChevronRightSolid,
      heroChevronDownSolid,
      heroHomeSolid
    })
  ],
  template: `
    <div class="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Loading State -->
      @if (isLoading()) {
        <div class="py-20">
          <app-loader size="lg" label="Loading files..."></app-loader>
        </div>
      } @else {
        <!-- Header Section -->
        <section class="mb-4">
          <nav class="flex items-center gap-1 py-1 text-sm overflow-x-auto whitespace-nowrap custom-scrollbar">
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-text-secondary hover:text-primary-600 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
              (click)="navigateToRoot()"
            >
              <ng-icon name="heroHomeSolid" size="16" class="text-primary-500"></ng-icon>
              <span class="tracking-tight uppercase text-[11px]">Documents</span>
            </button>
            
            @for (crumb of breadcrumbs(); track crumb.id; let last = $last) {
              <div class="flex items-center gap-1">
                <ng-icon name="heroChevronRightSolid" size="12" class="text-text-secondary/30"></ng-icon>
                <button
                  [class]="last ? 'border-primary-500 text-primary-600 font-bold' : 'border-transparent text-text-secondary hover:text-primary-600 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'"
                  class="px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 border"
                  (click)="!last && navigateToCrumb(crumb, $index)"
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
          <!-- Hierarchy Sidebar (Simplified) -->
          <aside class="col-span-12 lg:col-span-3 flex flex-col min-h-0">
            <app-card [padding]="false" [fullHeight]="true" class="flex-1 flex flex-col min-h-0">
              <div class="shrink-0 p-4 border-b border-border-color bg-gray-50/50 dark:bg-slate-800/50">
                <h3 class="font-semibold text-text-primary flex items-center gap-2">
                  <ng-icon name="heroFolderSolid" size="18" class="text-primary-600"></ng-icon>
                  Navigation
                </h3>
              </div>
              
              <div class="flex-1 p-2 overflow-y-auto custom-scrollbar">
                <button
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                  [class]="breadcrumbs().length === 0 && !searchQuery ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-primary'"
                  (click)="navigateToRoot()"
                >
                  <ng-icon name="heroHomeSolid" size="16" class="text-primary-500"></ng-icon>
                  <span class="truncate flex-1 text-left font-bold">All Clients</span>
                </button>

                <!-- Client Trees -->
                <div class="mt-2 space-y-0.5">
                  @for (client of filteredClients(); track client.id) {
                    <div>
                      <button
                        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group/node"
                        [class]="selectedClientId() === client.id && breadcrumbs().length === 1 ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-primary'"
                        (click)="navigateIntoClient(client)"
                      >
                        <ng-icon 
                          [name]="isExpanded(client.id) ? 'heroChevronDownSolid' : 'heroChevronRightSolid'" 
                          size="12" 
                          class="text-text-secondary/50 group-hover/node:text-primary-500"
                          (click)="toggleNode(client.id); $event.stopPropagation()"
                        ></ng-icon>
                        <ng-icon name="heroFolderSolid" size="16" class="text-amber-500"></ng-icon>
                        <span class="truncate flex-1 text-left">{{ client.code }}</span>
                      </button>
                      
                      @if (isExpanded(client.id)) {
                        <div class="ml-4 border-l border-slate-200 dark:border-slate-700 pl-1 mt-0.5 space-y-0.5">
                          @if (clientWorkspaces().get(client.id); as workspace) {
                            <ng-container *ngTemplateOutlet="folderTree; context: { folder: workspace.rootFolder, level: 0, clientId: client.id }"></ng-container>
                          } @else {
                            <div class="px-8 py-2 text-xs text-text-secondary italic">Loading...</div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </app-card>
          </aside>

          <!-- Recursive Tree Template -->
          <ng-template #folderTree let-folder="folder" let-level="level" let-clientId="clientId">
            @for (child of folder.children; track child.id) {
              <div>
                <button
                  class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all group/node"
                  [class]="selectedFolderId() === child.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-primary'"
                  (click)="navigateIntoFolder(child.id, child.name)"
                >
                  @if (child.children?.length) {
                    <ng-icon 
                      [name]="isExpanded(child.id) ? 'heroChevronDownSolid' : 'heroChevronRightSolid'" 
                      size="10" 
                      class="text-text-secondary/40 group-hover/node:text-primary-500"
                      (click)="toggleNode(child.id); $event.stopPropagation()"
                    ></ng-icon>
                  } @else {
                    <div class="w-2.5"></div>
                  }
                  <ng-icon 
                    name="heroFolderSolid" 
                    size="14" 
                    [class]="child.type === 'year' ? 'text-blue-500' : child.type === 'documents' ? 'text-green-500' : child.type === 'years' ? 'text-purple-500' : 'text-amber-500/70'"
                  ></ng-icon>
                  <span class="truncate flex-1 text-left text-[13px] leading-none">{{ child.name }}</span>
                  @if (child.fileCount > 0) {
                    <span class="text-[10px] text-text-secondary/60 font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {{ child.fileCount }}
                    </span>
                  }
                </button>
                
                @if (child.children?.length && isExpanded(child.id)) {
                  <div class="ml-3 border-l border-slate-200 dark:border-slate-700 pl-1 mt-0.5 space-y-0.5">
                    <ng-container *ngTemplateOutlet="folderTree; context: { folder: child, level: level + 1, clientId: clientId }"></ng-container>
                  </div>
                }
              </div>
            }
          </ng-template>

          <!-- File Explorer Main Area -->
          <main [class]="(viewState$ | async)?.showPreview || (viewState$ | async)?.showDetails ? 'col-span-12 lg:col-span-6' : 'col-span-12 lg:col-span-9'" class="flex flex-col min-h-0">
            <app-card [padding]="false" [fullHeight]="true" class="flex-1 flex flex-col min-h-0">
              <!-- Toolbar Integration -->
              <div class="border-b border-border-color">
                <app-file-view-toolbar 
                  [canGoBack]="false"
                  (refreshClicked)="refresh()"
                  [showUpload]="false"
                  [showNewFolder]="false">
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
                      <h2 class="text-xl font-bold text-text-primary">
                        {{ searchQuery ? 'Search Results' : (breadcrumbs().length > 0 ? breadcrumbs().slice(-1)[0].name : 'All Clients') }}
                      </h2>
                      <p class="text-sm text-text-secondary">
                        {{ fileItems().length }} items
                        @if (selectedClientId() && !searchQuery) {
                          · {{ getSelectedClientCode() }}
                        } @else if (searchQuery) {
                          · Matching "{{ searchQuery }}"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <!-- File Type Filter -->
                  <div class="flex items-center gap-3">
                    <select
                      [(ngModel)]="selectedMimeType"
                      (change)="loadFiles()"
                      class="px-3 py-2 rounded-lg border border-border-color bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    >
                      <option value="">All Types</option>
                      <option value="pdf">PDF</option>
                      <option value="image">Images</option>
                      <option value="word">Word Docs</option>
                      <option value="excel">Spreadsheets</option>
                    </select>
                    
                    <!-- Search -->
                    <div class="relative">
                      <ng-icon 
                        name="heroMagnifyingGlassSolid" 
                        size="16" 
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      ></ng-icon>
                      <input
                        type="text"
                        [(ngModel)]="searchQuery"
                        (input)="onSearchChange()"
                        placeholder="Search files..."
                        class="pl-9 pr-4 py-2 rounded-lg border border-border-color bg-gray-50 dark:bg-slate-800 text-sm w-64 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                    (filePreviewed)="onFilePreviewed($event)"
                    (fileDownloaded)="onFileDownloaded($event)"
                    (fileDeleted)="onFileDeleted($event)"
                  ></app-file-grid>
                  
                  <!-- Default Grid View -->
                  <app-file-grid
                    *ngSwitchDefault
                    [files]="fileItems()"
                    viewMode="large"
                    (fileSelected)="onFileSelected($event)"
                    (fileOpened)="onFileOpened($event)"
                    (filePreviewed)="onFilePreviewed($event)"
                    (fileDownloaded)="onFileDownloaded($event)"
                    (fileDeleted)="onFileDeleted($event)"
                  ></app-file-grid>
                } @else {
                  <!-- Empty State -->
                  <div class="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                    <mat-icon class="text-6xl h-24 w-24 mb-4 text-gray-300">folder_open</mat-icon>
                    <h3 class="text-xl font-medium mb-2">No files found</h3>
                    <p class="text-sm max-w-xs text-text-secondary mb-6">
                      @if (searchQuery || selectedMimeType || selectedClientId()) {
                        Try adjusting your filters or search query.
                      } @else {
                        Upload files to client workspaces to see them here.
                      }
                    </p>
                  </div>
                }
              </div>

              <!-- Status Bar & Pagination -->
              <footer class="px-4 py-2 bg-gray-50 dark:bg-slate-800 border-t border-border-color flex items-center justify-between text-xs text-text-secondary select-none">
                <div class="flex items-center gap-4">
                  <span>{{ fileItems().length }} items ({{ totalFiles() }} total)</span>
                  @if (selectedFile()) {
                    <span class="text-primary-600 font-medium">1 item selected</span>
                  }
                </div>
                <div class="flex items-center gap-3">
                  <!-- Pagination -->
                  @if (totalPages() > 1) {
                    <div class="flex items-center gap-2 mr-4">
                      <button 
                        class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        [disabled]="currentPage() === 1"
                        (click)="goToPage(currentPage() - 1)"
                      >
                        ←
                      </button>
                      <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
                      <button 
                        class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        [disabled]="currentPage() === totalPages()"
                        (click)="goToPage(currentPage() + 1)"
                      >
                        →
                      </button>
                    </div>
                  }
                  
                  <!-- View Mode Buttons -->
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

      <!-- Preview Modal -->
      @if (showPreviewModal()) {
        <div class="fixed inset-0 bg-black/90 z-modal-backdrop flex flex-col" (click)="closePreviewModal()">
          <div class="flex items-center justify-between p-4 text-white">
            <div class="flex items-center gap-3">
              <ng-icon [name]="isPdf(fileToPreview()?.mimeType || '') ? 'heroDocumentTextSolid' : 'heroPhotoSolid'" size="24"></ng-icon>
              <span class="font-medium">{{ fileToPreview()?.originalName }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button class="p-2 hover:bg-white/10 rounded-lg transition-colors" (click)="downloadPreviewFile(); $event.stopPropagation()">
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsListComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private workspaceService = inject(WorkspaceService);
  private clientService = inject(ClientService);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  public viewService = inject(ViewPreferenceService);
  public authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // View state
  viewState$ = this.viewService.state$;
  selectedFile = signal<FileItem | null>(null);

  // Data hierarchy
  files = signal<FileWithClientInfo[]>([]);
  clients = signal<Client[]>([]);
  currentFolders = signal<FolderNode[]>([]);
  currentFiles = signal<FileNode[]>([]);
  breadcrumbs = signal<Breadcrumb[]>([]);
  clientWorkspaces = signal<Map<string, WorkspaceTree>>(new Map());
  expandedNodes = signal<Set<string>>(new Set());

  isLoading = signal(true);
  totalFiles = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 50;

  // Filters
  selectedClientId = signal<string | null>(null);
  selectedFolderId = signal<string | null>(null);
  selectedMimeType = '';
  searchQuery = '';
  clientSearch = '';
  private searchTimeout: any;

  // Modal states
  showPreviewModal = signal(false);
  showDeleteModal = signal(false);
  fileToPreview = signal<FileWithClientInfo | null>(null);
  fileToDelete = signal<FileWithClientInfo | null>(null);
  previewUrl = signal<SafeResourceUrl | null>(null);

  // Computed file items for the grid
  fileItems = computed<FileItem[]>(() => {
    // 1. Search Mode: Show flattened files from all clients
    if (this.searchQuery || this.selectedMimeType) {
      return this.files().map(f => this.mapFileWithClientToFileItem(f));
    }

    // 2. Initial View (Root): Show Clients as folders
    if (this.breadcrumbs().length === 0) {
      return this.clients().map(c => ({
        id: c.id,
        name: c.code,
        type: 'folder',
        owner: c.user?.name || 'System',
        path: `clients/${c.code}`,
        modifiedDate: new Date(c.updatedAt),
        createdDate: new Date(c.createdAt),
        description: c.user?.name || 'Client Folder'
      }));
    }

    // 3. Exploring View: Show folders and files from current selection
    const folders: FileItem[] = this.currentFolders().map(f => ({
      id: f.id,
      name: f.name,
      type: 'folder',
      modifiedDate: new Date(),
      createdDate: new Date(),
      owner: 'System',
      path: f.slug || '',
      description: f.type
    }));

    const files: FileItem[] = this.currentFiles().map(f => ({
      id: f.id,
      name: f.originalName,
      type: this.getFileType(f.mimeType),
      size: f.size,
      modifiedDate: new Date(f.createdAt),
      createdDate: new Date(f.createdAt),
      owner: f.uploadedBy?.name || 'System',
      path: f.s3Path || '',
      description: this.selectedClientId() ? '' : this.getClientOfFile(f.id)
    }));

    return [...folders, ...files];
  });

  private mapFileWithClientToFileItem(f: FileWithClientInfo): FileItem {
    return {
      id: f.id,
      name: f.originalName,
      type: this.getFileType(f.mimeType),
      size: f.size,
      modifiedDate: new Date(f.createdAt),
      createdDate: new Date(f.createdAt),
      owner: f.uploadedBy?.name || 'System',
      path: f.s3Path || '',
      description: `${f.client?.code} / ${f.folder?.name}`
    };
  }

  private getClientOfFile(fileId: string): string {
    const f = this.files().find(f => f.id === fileId);
    return f?.client?.code || '';
  }

  // Filtered clients for sidebar
  filteredClients = computed(() => {
    const search = this.clientSearch.toLowerCase();
    if (!search) return this.clients();
    return this.clients().filter(c =>
      c.code.toLowerCase().includes(search) ||
      c.user?.name?.toLowerCase().includes(search)
    );
  });

  private getFileType(mime: string): 'pdf' | 'image' | 'text' | 'unknown' {
    if (mime?.includes('pdf')) return 'pdf';
    if (mime?.includes('image')) return 'image';
    if (mime?.includes('text') || mime?.includes('plain')) return 'text';
    return 'unknown';
  }

  ngOnInit() {
    this.loadClients();
    this.loadFiles();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClients(): void {
    this.clientService.getClients(1, 1000).subscribe({
      next: (res) => this.clients.set(res.data || []),
    });
  }

  loadFiles(): void {
    this.isLoading.set(true);

    this.workspaceService.getAllFiles({
      page: this.currentPage(),
      limit: this.pageSize,
      search: this.searchQuery || undefined,
      clientId: this.selectedClientId() || undefined,
      mimeType: this.selectedMimeType || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (res) => {
        this.files.set(res.data || []);
        this.totalFiles.set(res.meta?.total || 0);
        this.totalPages.set(res.meta?.totalPages || 1);
      },
      error: (err) => {
        this.toast.error('Failed to load files', err.message);
      },
    });
  }

  refresh(): void {
    if (this.searchQuery || this.selectedMimeType) {
      this.loadFiles();
    } else if (this.selectedFolderId()) {
      this.navigateIntoFolder(this.selectedFolderId()!, this.breadcrumbs().slice(-1)[0].name);
    } else if (this.selectedClientId()) {
      const client = this.clients().find(c => c.id === this.selectedClientId());
      if (client) this.navigateIntoClient(client);
    } else {
      this.navigateToRoot();
    }
  }

  navigateToRoot(): void {
    this.searchQuery = '';
    this.selectedMimeType = '';
    this.selectedClientId.set(null);
    this.selectedFolderId.set(null);
    this.breadcrumbs.set([]);
    this.currentFolders.set([]);
    this.currentFiles.set([]);
    this.loadClients();
    this.loadFiles(); // Still load files for total count and search fallback
  }

  navigateIntoClient(client: Client): void {
    this.isLoading.set(true);
    this.selectedClientId.set(client.id);
    this.selectedFolderId.set(null);
    this.breadcrumbs.set([{ id: client.id, name: client.code }]);

    // Auto-expand in sidebar
    this.toggleNode(client.id, true);

    this.workspaceService.getClientWorkspace(client.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          const workspace = res.data;
          // Store in workspaces map for tree
          const map = new Map(this.clientWorkspaces());
          map.set(client.id, workspace);
          this.clientWorkspaces.set(map);

          const root = workspace.rootFolder;
          this.currentFolders.set(root.children || []);
          this.currentFiles.set(root.files || []);
        },
        error: (err) => this.toast.error('Failed to load client workspace', err.message)
      });
  }

  isExpanded(id: string): boolean {
    return this.expandedNodes().has(id);
  }

  toggleNode(id: string, forceExpand: boolean = false): void {
    const set = new Set(this.expandedNodes());
    if (forceExpand) {
      set.add(id);
    } else {
      if (set.has(id)) set.delete(id);
      else set.add(id);
    }
    this.expandedNodes.set(set);

    // If it's a client and not loaded, load it
    const client = this.clients().find(c => c.id === id);
    if (client && !this.clientWorkspaces().has(id)) {
      this.loadClientWorkspace(client);
    }
  }

  private loadClientWorkspace(client: Client): void {
    this.workspaceService.getClientWorkspace(client.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const map = new Map(this.clientWorkspaces());
          map.set(client.id, res.data);
          this.clientWorkspaces.set(map);
        }
      });
  }

  navigateIntoFolder(folderId: string, folderName: string): void {
    this.isLoading.set(true);
    this.selectedFolderId.set(folderId);

    // Add to breadcrumbs if not already there
    const currentCrumbs = this.breadcrumbs();
    if (!currentCrumbs.find(c => c.id === folderId)) {
      this.breadcrumbs.set([...currentCrumbs, { id: folderId, name: folderName }]);
    }

    this.workspaceService.getFolderContents(folderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.currentFolders.set(res.data.folder.children || []);
          this.currentFiles.set(res.data.folder.files || []);
        },
        error: (err) => this.toast.error('Failed to load folder', err.message)
      });
  }

  navigateToCrumb(crumb: Breadcrumb, index: number): void {
    const newCrumbs = this.breadcrumbs().slice(0, index + 1);
    this.breadcrumbs.set(newCrumbs);

    if (index === 0) {
      // It's the client
      const client = this.clients().find(c => c.id === crumb.id);
      if (client) this.navigateIntoClient(client);
    } else {
      // It's a folder
      this.navigateIntoFolder(crumb.id, crumb.name);
    }
  }

  selectClient(clientId: string | null): void {
    if (!clientId) {
      this.navigateToRoot();
      return;
    }
    const client = this.clients().find(c => c.id === clientId);
    if (client) this.navigateIntoClient(client);
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadFiles();
    }, 300);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadFiles();
    }
  }

  getSelectedClientCode(): string {
    const client = this.clients().find(c => c.id === this.selectedClientId());
    return client?.code || '';
  }

  getSelectedClientName(): string {
    const client = this.clients().find(c => c.id === this.selectedClientId());
    return client?.user?.name || client?.code || 'Client Files';
  }

  // File actions
  onFileSelected(file: FileItem): void {
    this.selectedFile.set(file);
  }

  onFileOpened(file: FileItem): void {
    if (file.type === 'folder') {
      const client = this.clients().find(c => c.id === file.id);
      if (client) {
        this.navigateIntoClient(client);
      } else {
        this.navigateIntoFolder(file.id, file.name);
      }
      return;
    }

    const fileData = this.files().find(f => f.id === file.id) ||
      this.currentFiles().map(f => ({ ...f, client: { id: this.selectedClientId(), code: this.getSelectedClientCode() }, folder: { id: this.selectedFolderId(), name: '' } } as any as FileWithClientInfo)).find(f => f.id === file.id);

    if (!fileData) {
      // Try to construct a minimal FileWithClientInfo from signal data if needed
      const currentF = this.currentFiles().find(f => f.id === file.id);
      if (currentF) {
        this.previewFile({
          ...currentF,
          client: { id: this.selectedClientId()!, code: this.getSelectedClientCode(), name: this.getSelectedClientName() },
          folder: { id: this.selectedFolderId()!, name: '', type: '' }
        } as any);
      }
      return;
    }
    this.previewFile(fileData);
  }

  onFilePreviewed(file: FileItem): void {
    const fileData = this.files().find(f => f.id === file.id);
    if (fileData) {
      this.previewFile(fileData);
    }
  }

  onFileDownloaded(file: FileItem): void {
    const fileData = this.files().find(f => f.id === file.id);
    if (fileData) {
      this.downloadFile(fileData);
    }
  }

  onFileDeleted(file: FileItem): void {
    const fileData = this.files().find(f => f.id === file.id);
    if (fileData) {
      this.fileToDelete.set(fileData);
      this.showDeleteModal.set(true);
    }
  }

  previewFile(file: FileWithClientInfo): void {
    this.fileToPreview.set(file);
    this.showPreviewModal.set(true);
    this.previewUrl.set(null);

    this.workspaceService.getFileDownloadUrl(file.id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const url = res.data.url;
          if (this.isPdf(file.mimeType)) {
            this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
          } else {
            this.previewUrl.set(url);
          }
        },
        error: () => {
          this.toast.error('Failed to load preview');
          this.closePreviewModal();
        }
      });
  }

  downloadFile(file: FileWithClientInfo): void {
    this.workspaceService.getFileDownloadUrl(file.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.workspaceService.downloadFile(res.data.url, file.originalName);
          this.toast.success('Download started');
        },
        error: () => {
          this.toast.error('Failed to download file');
        }
      });
  }

  downloadPreviewFile(): void {
    const file = this.fileToPreview();
    if (file) {
      this.downloadFile(file);
    }
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
    this.fileToPreview.set(null);
    this.previewUrl.set(null);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.fileToDelete.set(null);
  }

  confirmDelete(): void {
    const file = this.fileToDelete();
    if (!file) return;

    this.workspaceService.deleteFile(file.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('File deleted');
          this.closeDeleteModal();
          this.loadFiles();
        },
        error: () => {
          this.toast.error('Failed to delete file');
        }
      });
  }

  isPdf(mimeType: string): boolean {
    return mimeType?.includes('pdf') || false;
  }

  isImage(mimeType: string): boolean {
    return mimeType?.includes('image') || false;
  }
}
