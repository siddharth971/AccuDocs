import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  status: string;
  fileName?: string;
  required: boolean;
}

@Component({
  selector: 'app-public-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading State -->
    @if (loading()) {
      <div class="upload-page">
        <div class="upload-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading your checklist...</p>
          </div>
        </div>
      </div>
    }

    <!-- Error State -->
    @if (error()) {
      <div class="upload-page">
        <div class="upload-container">
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h2>{{ error() }}</h2>
            <p>Please contact your accountant for a new upload link.</p>
          </div>
        </div>
      </div>
    }

    <!-- Expired State -->
    @if (!loading() && !error() && expired()) {
      <div class="upload-page">
        <div class="upload-container">
          <div class="error-state">
            <div class="error-icon">⏰</div>
            <h2>This upload link has expired</h2>
            <p>Please contact your accountant for a new link.</p>
          </div>
        </div>
      </div>
    }

    <!-- Upload Page -->
    @if (!loading() && !error() && !expired() && checklist()) {
      <div class="upload-page">

        <!-- Header -->
        <header class="upload-header">
          <div class="header-content">
            <div class="logo">
              <span class="logo-icon">📋</span>
              <span class="logo-text">AccuDocs</span>
            </div>
          </div>
        </header>

        <div class="upload-container">
          <!-- Checklist Info -->
          <div class="checklist-info">
            <h1 class="checklist-title">{{ checklist()?.name }}</h1>
            <div class="meta-row">
              <span class="meta-item">
                <span class="meta-icon">👤</span>
                {{ clientName() }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">📅</span>
                {{ checklist()?.financialYear }}
              </span>
              @if (checklist()?.dueDate) {
                <span class="meta-item" [class.overdue]="isDueDate()">
                  <span class="meta-icon">⏰</span>
                  Due: {{ checklist()?.dueDate | date: 'dd MMM yyyy' }}
                </span>
              }
            </div>

            <!-- Progress Bar -->
            <div class="progress-section">
              <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" [style.width.%]="progressPercent()"></div>
              </div>
              <span class="progress-text">{{ uploadedCount() }}/{{ items().length }} uploaded</span>
            </div>
          </div>

          <!-- Items List -->
          <div class="items-list">
            @for (item of items(); track item.id) {
              <div class="item-card" [class.uploaded]="item.status !== 'pending'" [class.pending]="item.status === 'pending'">
                <div class="item-header">
                  <div class="item-status-icon">
                    @if (item.status === 'pending') { ⏳ }
                    @else if (item.status === 'uploaded') { ✅ }
                    @else if (item.status === 'verified') { ✓ }
                    @else { ❌ }
                  </div>
                  <div class="item-info">
                    <h3 class="item-label">{{ item.label }}</h3>
                    @if (item.description) {
                      <p class="item-desc">{{ item.description }}</p>
                    }
                    @if (item.fileName) {
                      <p class="item-file">📎 {{ item.fileName }}</p>
                    }
                  </div>
                </div>

                <div class="item-actions">
                  @if (item.status === 'pending') {
                    @if (uploadingItemId() === item.id) {
                      <div class="uploading-indicator">
                        <div class="mini-spinner"></div>
                        Uploading...
                      </div>
                    } @else {
                      <label class="upload-btn" [for]="'file-' + item.id">
                        📤 Upload
                        <input
                          [id]="'file-' + item.id"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv"
                          (change)="onFileSelected($event, item.id)"
                          hidden
                        />
                      </label>
                    }
                  } @else {
                    <span class="status-badge" [class]="item.status">
                      {{ item.status | titlecase }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Upload Success Toast -->
          @if (uploadSuccess()) {
            <div class="toast success">
              ✅ {{ uploadSuccess() }}
            </div>
          }

          <!-- Upload Error Toast -->
          @if (uploadError()) {
            <div class="toast error">
              ❌ {{ uploadError() }}
            </div>
          }

          <!-- Footer -->
          <div class="upload-footer">
            <p>Powered by <strong>AccuDocs</strong> | Your documents are encrypted and secure 🔒</p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }

    .upload-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      font-family: 'Inter', 'Segoe UI', sans-serif;
      color: #e2e8f0;
    }

    .upload-header {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 16px 24px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      align-items: center;
    }

    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 22px; font-weight: 700; background: linear-gradient(135deg, #818cf8, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .upload-container {
      max-width: 720px;
      margin: 0 auto;
      padding: 32px 20px;
    }

    /* Loading & Error States */
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 20px;
      text-align: center;
    }

    .spinner {
      width: 48px; height: 48px;
      border: 4px solid rgba(99, 102, 241, 0.2);
      border-top: 4px solid #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .mini-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(99, 102, 241, 0.2);
      border-top: 2px solid #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-icon { font-size: 48px; margin-bottom: 16px; }
    .error-state h2 { font-size: 20px; margin: 0 0 8px; }
    .error-state p { color: #94a3b8; }

    /* Checklist Info */
    .checklist-info {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
    }

    .checklist-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px;
      background: linear-gradient(135deg, #f8fafc, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #94a3b8;
      background: rgba(255,255,255,0.04);
      padding: 6px 12px;
      border-radius: 8px;
    }

    .meta-item.overdue { color: #f87171; background: rgba(248, 113, 113, 0.08); }
    .meta-icon { font-size: 14px; }

    /* Progress */
    .progress-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-bar-wrapper {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.06);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #818cf8);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .progress-text {
      font-size: 13px;
      color: #94a3b8;
      white-space: nowrap;
    }

    /* Items */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 16px 20px;
      transition: all 0.2s ease;
    }

    .item-card.pending { border-left: 3px solid #f59e0b; }
    .item-card.uploaded { border-left: 3px solid #22c55e; opacity: 0.8; }

    .item-card:hover { background: rgba(255,255,255,0.05); }

    .item-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .item-status-icon { font-size: 20px; }

    .item-label {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 2px;
      color: #f1f5f9;
    }

    .item-desc {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }

    .item-file {
      font-size: 12px;
      color: #6366f1;
      margin: 4px 0 0;
    }

    /* Upload button */
    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: linear-gradient(135deg, #6366f1, #818cf8);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      white-space: nowrap;
    }

    .upload-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .uploading-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #818cf8;
    }

    .status-badge {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 99px;
      white-space: nowrap;
    }

    .status-badge.uploaded { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .status-badge.verified { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      z-index: 200;
      animation: fadeInUp 0.3s ease;
    }

    .toast.success {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .toast.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateX(-50%) translateY(12px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    /* Footer */
    .upload-footer {
      text-align: center;
      padding: 32px 0 16px;
      font-size: 12px;
      color: #475569;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .upload-container { padding: 16px 12px; }
      .checklist-info { padding: 20px 16px; }
      .checklist-title { font-size: 20px; }
      .meta-row { gap: 8px; }
      .item-card { flex-direction: column; align-items: flex-start; gap: 12px; padding: 14px 16px; }
      .item-actions { width: 100%; }
      .upload-btn { width: 100%; justify-content: center; }
    }
  `],
})
export class PublicUploadComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loading = signal(true);
  error = signal<string | null>(null);
  expired = signal(false);
  checklist = signal<any>(null);
  clientName = signal('');
  items = signal<ChecklistItem[]>([]);
  uploadingItemId = signal<string | null>(null);
  uploadSuccess = signal<string | null>(null);
  uploadError = signal<string | null>(null);

  uploadedCount = computed(() => this.items().filter(i => i.status !== 'pending').length);
  progressPercent = computed(() => {
    const total = this.items().length;
    return total > 0 ? Math.round((this.uploadedCount() / total) * 100) : 0;
  });

  isDueDate = computed(() => {
    const d = this.checklist()?.dueDate;
    return d ? new Date(d) < new Date() : false;
  });

  private token = '';

  ngOnInit() {
    this.token = this.route.snapshot.params['token'];
    this.loadChecklist();
  }

  private loadChecklist() {
    this.http.get<any>(`${this.apiUrl}/upload/${this.token}`).subscribe({
      next: (res) => {
        if (res.data.expired) {
          this.expired.set(true);
        } else {
          this.checklist.set(res.data.checklist);
          this.clientName.set(res.data.client?.user?.name || res.data.client?.code || 'Client');
          this.items.set(res.data.items || []);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Invalid or expired link');
        this.loading.set(false);
      },
    });
  }

  onFileSelected(event: Event, itemId: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Client-side validation
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showError(`File is too large (${Math.round(file.size / 1024 / 1024)}MB). Max 50MB.`);
      return;
    }

    this.uploadingItemId.set(itemId);
    this.uploadSuccess.set(null);
    this.uploadError.set(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', itemId);

    this.http.post<any>(`${this.apiUrl}/upload/${this.token}`, formData).subscribe({
      next: (res) => {
        this.uploadingItemId.set(null);
        this.showSuccess(`"${file.name}" uploaded successfully!`);

        // Update item in list
        const updated = this.items().map(i =>
          i.id === itemId ? { ...i, status: 'uploaded', fileName: file.name } : i
        );
        this.items.set(updated);

        // Reset input
        input.value = '';
      },
      error: (err) => {
        this.uploadingItemId.set(null);
        this.showError(err.error?.message || 'Upload failed. Please try again.');
        input.value = '';
      },
    });
  }

  private showSuccess(msg: string) {
    this.uploadSuccess.set(msg);
    setTimeout(() => this.uploadSuccess.set(null), 4000);
  }

  private showError(msg: string) {
    this.uploadError.set(msg);
    setTimeout(() => this.uploadError.set(null), 5000);
  }
}
