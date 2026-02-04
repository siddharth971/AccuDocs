import { SafeResourceUrl } from '@angular/platform-browser';

export type ViewMode =
  | 'extra-large'
  | 'large'
  | 'medium'
  | 'small'
  | 'list'
  | 'details'
  | 'tiles'
  | 'content';

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'image' | 'text' | 'unknown';
  size?: number; // bytes
  modifiedDate: Date;
  createdDate: Date;
  owner: string;
  path: string;
  description?: string;
  thumbnailUrl?: string | SafeResourceUrl;
}

export interface ViewState {
  viewMode: ViewMode;
  showPreview: boolean;
  showDetails: boolean;
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
}

export const VIEW_MODES: { label: string; value: ViewMode; icon: string }[] = [
  { label: 'Extra Large Icons', value: 'extra-large', icon: 'view_comfy' },
  { label: 'Large Icons', value: 'large', icon: 'grid_view' },
  { label: 'Medium Icons', value: 'medium', icon: 'grid_3x3' },
  { label: 'Small Icons', value: 'small', icon: 'apps' },
  { label: 'List', value: 'list', icon: 'view_list' },
  { label: 'Details', value: 'details', icon: 'view_headline' },
  { label: 'Tiles', value: 'tiles', icon: 'dashboard' },
  { label: 'Content', value: 'content', icon: 'description' },
];
