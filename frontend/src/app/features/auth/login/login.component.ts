import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginFacade } from './login.facade';
import { ButtonComponent } from '@ui/atoms/button.component';
import { CardComponent } from '@ui/molecules/card.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPhoneSolid, heroLockClosedSolid, heroEyeSolid, heroEyeSlashSolid, heroArrowRightOnRectangleSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    LoginFacade,
    provideIcons({ heroPhoneSolid, heroLockClosedSolid, heroEyeSolid, heroEyeSlashSolid, heroArrowRightOnRectangleSolid })
  ],
  template: `
    <div class="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Brand / Identity -->
        <div class="flex justify-center flex-col items-center">
          <div class="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200 rotate-3 transition-transform hover:rotate-0 duration-500">
            <ng-icon name="heroLockClosedSolid" size="32"></ng-icon>
          </div>
          <h2 class="mt-8 text-center text-4xl font-black text-slate-900 tracking-tight">
            AccuDocs Portal
          </h2>
          <p class="mt-3 text-center text-base text-slate-500 font-medium">
            Enter your credentials to access your documents
          </p>
        </div>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Standalone Login Container -->
        <div class="bg-white px-8 py-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white/50 backdrop-blur-sm relative overflow-hidden group">
          <!-- Subtle decoration -->
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <form class="space-y-7 relative z-10" (ngSubmit)="facade.login()">
            <!-- Mobile Field -->
            <div class="space-y-2">
              <label for="mobile" class="block text-sm font-bold text-slate-700 ml-1">
                Mobile Number
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <ng-icon name="heroPhoneSolid" size="20"></ng-icon>
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="text"
                  [(ngModel)]="facade.form.value().mobile"
                  class="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 placeholder-slate-400 font-medium transition-all focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 placeholder:opacity-50"
                  [class.!border-red-500]="facade.form.errors().mobile"
                  placeholder="+919XXXXXXXXX"
                />
              </div>
              @if (facade.form.errors().mobile) {
                <p class="mt-1 text-xs text-red-500 font-bold ml-1 flex items-center gap-1 animate-in slide-in-from-left-2">
                  <span class="w-1 h-1 bg-red-500 rounded-full"></span>
                  {{ facade.form.errors().mobile?.[0] }}
                </p>
              }
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-bold text-slate-700 ml-1">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <ng-icon name="heroLockClosedSolid" size="20"></ng-icon>
                </div>
                <input
                  id="password"
                  name="password"
                  [type]="facade.hidePassword() ? 'password' : 'text'"
                  [(ngModel)]="facade.form.value().password"
                  class="block w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 placeholder-slate-400 font-medium transition-all focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  [class.!border-red-500]="facade.form.errors().password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  (click)="facade.hidePassword.set(!facade.hidePassword())"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <ng-icon [name]="facade.hidePassword() ? 'heroEyeSolid' : 'heroEyeSlashSolid'" size="20"></ng-icon>
                </button>
              </div>
              @if (facade.form.errors().password) {
                <p class="mt-1 text-xs text-red-500 font-bold ml-1 flex items-center gap-1 animate-in slide-in-from-left-2">
                  <span class="w-1 h-1 bg-red-500 rounded-full"></span>
                  {{ facade.form.errors().password?.[0] }}
                </p>
              }
            </div>

            <div class="flex items-center justify-between px-1">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-lg cursor-pointer transition-colors"
                />
                <label for="remember-me" class="ml-3 block text-sm font-semibold text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div class="text-sm font-bold">
                <a href="#" class="text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline">
                  Forgot?
                </a>
              </div>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="facade.form.isSubmitting()"
                class="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-2xl shadow-xl shadow-blue-100 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                @if (facade.form.isSubmitting()) {
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                } @else {
                  Sign In
                  <ng-icon name="heroArrowRightOnRectangleSolid" class="ml-2" size="20"></ng-icon>
                }
              </button>
            </div>
          </form>

          <footer class="mt-8 border-t border-slate-100 pt-8 text-center">
             <p class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
               Secure Environment
               <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
             </p>
          </footer>
        </div>

        <p class="mt-12 text-center text-sm font-semibold text-slate-400">
          Built for <span class="text-slate-600">Professional Accountants</span>
          <br>
          <span class="text-[10px] uppercase tracking-tighter opacity-50 mt-2 block">© 2024 AccuDocs v1.2</span>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  facade = inject(LoginFacade);
}
