import { IoAdapter } from '@nestjs/platform-socket.io';

export class RedisIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: any): any {
        let redisIoAdapter = require('socket.io-redis');
        const server = super.createIOServer(port, options);
        const redisAdapter = redisIoAdapter({ host: 'localhost', port: 6379 });

        server.adapter(redisAdapter);
        return server;
    }
}