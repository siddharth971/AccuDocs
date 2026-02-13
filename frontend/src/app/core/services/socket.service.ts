
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private url = environment.apiUrl.replace('/api/v1', '');

  constructor() {
    this.socket = io(this.url, {
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  // Listen to an event
  on(eventName: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(eventName, (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.off(eventName);
      };
    });
  }

  // Emit an event
  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
