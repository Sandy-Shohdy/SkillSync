import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { User } from './users/entities/user.entity';
import { Booking } from './bookings/entities/booking.entity';
import { Notification } from './notifications/entities/notification.entity';

// Accepts a bare URL or Neon's copied `psql 'postgresql://...'` command.
function resolveDatabaseUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  const match = value.match(/postgres(?:ql)?:\/\/[^\s'"]+/);
  if (!match) {
    throw new Error(
      'DATABASE_URL in backend/.env is not a PostgreSQL connection string. ' +
        'Copy the value that starts with postgresql:// from the Neon Connect dialog.',
    );
  }
  // pg already treats sslmode=require as verify-full; say so explicitly to
  // keep certificate verification and silence pg's deprecation warning.
  return match[0].replace(/([?&]sslmode=)require\b/, '$1verify-full');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = resolveDatabaseUrl(
          config.get<string>('DATABASE_URL'),
        );
        return {
          type: 'postgres' as const,
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: config.get<string>('DB_HOST', 'localhost'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.get<string>('DB_USERNAME'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_NAME', 'skillsync'),
              }),
          entities: [User, Booking, Notification],
          synchronize: config.get<string>('NODE_ENV') !== 'production',
        };
      },
    }),
    AuthModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
