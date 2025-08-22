import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { PacientesModule } from './pacientes/pacientes.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { EvolucoesModule } from './evolucoes/evolucoes.module';
import { ExamesPreopModule } from './exames-preop/exames-preop.module';
import { ReceitasModule } from './receitas/receitas.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
    AuthModule,
    PacientesModule,
    AvaliacoesModule,
    EvolucoesModule,
    ExamesPreopModule,
    ReceitasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
