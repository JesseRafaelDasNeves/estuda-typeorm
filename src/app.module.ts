import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Meeting } from './entities/meeting.entity';
import { EmployeesModule } from './employees/employees.module';
import { ReportsModule } from './reports/reports.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: 'redis://localhost:6379',
      defaultJobOptions: {
        /* remove os jobs assin que forem concluídos mas mantém os últimos 100 */
        removeOnComplete: 100,
        /* Ir removendo os jobs que não coinseguir executar mas manter os últimos 1000 */
        removeOnFail: 1000,
        /* Número de tentativa para executar o job quando dá erro */
        attempts: 3,
        /* O tempo de espera após cada tentativa quando dá erro ao executar o job */
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Task, Meeting]),
    EmployeesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
