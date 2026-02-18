import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginFacade } from './login.facade';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPhoneSolid,
  heroLockClosedSolid,
  heroEyeSolid,
  heroEyeSlashSolid,
  heroArrowRightOnRectangleSolid,
  heroShieldCheckSolid
} from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    LoginFacade,
    provideIcons({
      heroPhoneSolid,
      heroLockClosedSolid,
      heroEyeSolid,
      heroEyeSlashSolid,
      heroArrowRightOnRectangleSolid,
      heroShieldCheckSolid
    })
  ],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center px-4 bg-[#f8fafc]">

      <!-- Logo + Identity -->
      <div class="flex flex-col items-center" style="margin-bottom: 40px;">
        <!-- Rotated blue square with lock icon -->
        <div class="w-[72px] h-[72px] bg-[#0074c9] rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-[6deg] transition-transform duration-500 hover:rotate-0">
          <ng-icon name="heroLockClosedSolid" size="32" class="-rotate-[6deg]"></ng-icon>
        </div>
        <h1 class="mt-4 text-4xl font-black text-slate-900 tracking-tight" style="letter-spacing: -0.03em; line-height: 1.1;">
          AccuDocs Portal
        </h1>
        <p class="mt-2 text-[15px] font-medium text-slate-500" style="letter-spacing: -0.01em;">
          Secure document management for professionals
        </p>
      </div>

      <!-- Login Card -->
      <div class="w-[420px] max-w-[calc(100vw-32px)] relative" style="margin-bottom: 24px;">
        <div
          class="bg-white rounded-3xl border border-slate-200 overflow-hidden"
          style="padding: 40px; box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.08);"
        >
          <!-- Gradient decoration bar -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0074c9] to-[#0284c7] rounded-t-3xl"></div>

          <!-- Card Title -->
          <h2 class="text-xl font-bold text-slate-900 text-center" style="margin-bottom: 32px;">
            Sign in to your account
          </h2>

          <form class="space-y-5" (ngSubmit)="facade.login()">
            <!-- Phone Number Field -->
            <div>
              <label for="mobile" class="block text-[13px] font-semibold text-slate-600 mb-2 ml-0.5">
                Phone Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="text"
                autocomplete="tel"
                [(ngModel)]="facade.form.value().mobile"
                class="block w-full h-12 px-4 bg-[#f8fafc] border-[1.5px] border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder-slate-400 transition-all duration-200 focus:bg-white focus:border-[#0074c9] focus:outline-none"
                style="--tw-ring-color: rgba(0, 116, 201, 0.1);"
                [class.!border-red-500]="facade.form.errors().mobile"
                [class.focus:shadow-[0_0_0_4px_rgba(0,116,201,0.1)]]="true"
                placeholder="+919XXXXXXXXX"
              />
              @if (facade.form.errors().mobile) {
                <p class="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1.5 ml-0.5 animate-in slide-in-from-left-2">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                  {{ facade.form.errors().mobile?.[0] }}
                </p>
              }
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-[13px] font-semibold text-slate-600 mb-2 ml-0.5">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  [type]="facade.hidePassword() ? 'password' : 'text'"
                  [(ngModel)]="facade.form.value().password"
                  class="block w-full h-12 pl-4 pr-12 bg-[#f8fafc] border-[1.5px] border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder-slate-400 transition-all duration-200 focus:bg-white focus:border-[#0074c9] focus:outline-none"
                  [class.!border-red-500]="facade.form.errors().password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  (click)="facade.hidePassword.set(!facade.hidePassword())"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  <ng-icon [name]="facade.hidePassword() ? 'heroEyeSolid' : 'heroEyeSlashSolid'" size="20"></ng-icon>
                </button>
              </div>
              @if (facade.form.errors().password) {
                <p class="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1.5 ml-0.5 animate-in slide-in-from-left-2">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                  {{ facade.form.errors().password?.[0] }}
                </p>
              }
            </div>

            <!-- Options Row -->
            <div class="flex items-center justify-between px-0.5" style="margin-top: 20px;">
              <div class="flex items-center gap-2.5">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  class="h-[18px] w-[18px] rounded-md border-[1.5px] border-slate-300 text-[#0074c9] focus:ring-[#0074c9] cursor-pointer transition-colors accent-[#0074c9]"
                />
                <label for="remember-me" class="text-[13px] font-medium text-slate-500 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <a href="#" class="text-[13px] font-semibold text-[#0074c9] hover:text-[#005fa3] hover:underline transition-colors">
                Forgot password?
              </a>
            </div>

            <!-- CTA Button -->
            <div style="margin-top: 28px;">
              <button
                type="submit"
                [disabled]="facade.form.isSubmitting()"
                class="w-full h-[52px] flex items-center justify-center bg-[#0074c9] text-white text-[15px] font-bold rounded-2xl border-none transition-all duration-200 hover:bg-[#005fa3] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,116,201,0.25)]"
                style="box-shadow: 0 8px 24px -4px rgba(0, 116, 201, 0.3);"
              >
                @if (facade.form.isSubmitting()) {
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                } @else {
                  Sign In
                  <ng-icon name="heroArrowRightOnRectangleSolid" class="ml-2" size="20"></ng-icon>
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer Security Note -->
      <div class="flex items-center gap-2 text-slate-400">
        <ng-icon name="heroShieldCheckSolid" size="16"></ng-icon>
        <span class="text-xs font-medium" style="letter-spacing: 0.01em;">256-bit SSL encrypted. Your data is secure.</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  facade = inject(LoginFacade);
}
