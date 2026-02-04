import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ViewMode, ViewState } from '../models/file-explorer.models';

const STORAGE_KEY = 'file-explorer-view-prefs';

const DEFAULT_STATE: ViewState = {
  viewMode: 'large',
  showPreview: false,
  showDetails: false,
  sortBy: 'name',
  sortOrder: 'asc'
};

@Injectable({
  providedIn: 'root'
})
export class ViewPreferenceService {
  private stateSubject = new BehaviorSubject<ViewState>(this.loadState());
  public state$: Observable<ViewState> = this.stateSubject.asObservable();

  constructor() { }

  private loadState(): ViewState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Failed to parse file explorer prefs', e);
      }
    }
    return DEFAULT_STATE;
  }

  private saveState(state: ViewState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.stateSubject.next(state);
  }

  updateViewMode(mode: ViewMode) {
    const current = this.stateSubject.value;
    this.saveState({ ...current, viewMode: mode });
  }

  togglePreview() {
    const current = this.stateSubject.value;
    // If details is open, close it (optional mutual exclusivity behavior, windows explorer often allows one pane)
    // Windows Explorer allows Preview OR Details pane, not both usually.
    this.saveState({
      ...current,
      showPreview: !current.showPreview,
      showDetails: current.showPreview ? current.showDetails : false // Close details if opening preview? 
      // Actually Windows explorer toggles: if you click Details pane, Preview functionality disables.
    });
  }

  setPreview(show: boolean) {
    const current = this.stateSubject.value;
    this.saveState({ ...current, showPreview: show, showDetails: show ? false : current.showDetails });
  }

  toggleDetails() {
    const current = this.stateSubject.value;
    this.saveState({
      ...current,
      showDetails: !current.showDetails,
      showPreview: current.showDetails ? current.showPreview : false
    });
  }

  setDetails(show: boolean) {
    const current = this.stateSubject.value;
    this.saveState({ ...current, showDetails: show, showPreview: show ? false : current.showPreview });
  }

  updateSort(sortBy: 'name' | 'date' | 'size' | 'type') {
    const current = this.stateSubject.value;
    const sortOrder = (current.sortBy === sortBy && current.sortOrder === 'asc') ? 'desc' : 'asc';
    this.saveState({ ...current, sortBy, sortOrder });
  }
}
