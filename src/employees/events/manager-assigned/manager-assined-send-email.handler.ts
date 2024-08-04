import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ManagerAssinedEvent } from './manager-assined.event';
import { DataSource } from 'typeorm';
import { Employee } from 'src/employees/entities/employee.entity';
import { Job, Queue } from 'bull';
import { InjectQueue, Process, Processor } from '@nestjs/bull';

@EventsHandler(ManagerAssinedEvent)
@Processor('employees')
export class ManagerAssigned_SendEmailHandler
  implements IEventHandler<ManagerAssinedEvent>
{
  constructor(
    private readonly dataSource: DataSource,
    @InjectQueue('employees')
    private readonly queue: Queue,
  ) {}
  async handle(event: ManagerAssinedEvent) {
    await this.queue.add('manager-assigned-send-email', event);
  }

  @Process('manager-assigned-send-email')
  async process(job: Job<ManagerAssinedEvent>) {
    console.log(`Attemp #${job.attemptsMade}`);

    const event = job.data;
    const manager = await this.dataSource.manager.findOne(Employee, {
      where: { id: event.managerId },
      relations: ['contactInfo'],
    });

    if (!manager.contactInfo?.email) return;

    //Buscar a informação do funionário
    const employee = await this.dataSource.manager.findOne(Employee, {
      where: { id: event.employeeId },
    });

    if (job.attemptsMade === 0) {
      throw new Error('Failed to send e-mail');
    }

    //Send E-mail
    console.log(
      `Send email to ${manager.name}, saying that ${employee.name} has joined their team.`,
    );
  }
}
