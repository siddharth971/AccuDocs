
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger';

class SocketService {
  private io: Server | null = null;

  public initialize(httpServer: HttpServer, allowedOrigins: string[]) {
    this.io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`🔌 Socket connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    logger.info('✅ Socket.IO initialized');
  }

  public emit(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
