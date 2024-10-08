import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Employee } from './employees/entities/employee.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { ContactInfo } from './employees/entities/contact-info.entity';
import { Task } from './entities/task.entity';
import { Meeting } from './entities/meeting.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async seed() {
    await this.dataSource.transaction(async (db) => {
      const ceo = db.create(Employee, {
        name: 'Mr. CEO',
        contactInfo: db.create(ContactInfo, {
          email: 'ceo@acme.com',
        }),
      });
      await db.save(ceo);

      const manager = db.create(Employee, {
        name: 'Manager',
        manager: ceo,
        contactInfo: db.create(ContactInfo, {
          email: 'manager@acme.com',
        }),
      });
      await db.save(manager);

      const task1 = db.create(Task, {
        name: 'Mire People',
        assignee: manager,
      });

      const task2 = db.create(Task, {
        name: 'Present to CEO',
        assignee: manager,
      });

      await db.save([task1, task2]);

      const meeting = db.create(Meeting, {
        attendees: [ceo],
        zoomUrl: 'https://zoon.us/123',
      });
      await db.save(meeting);

      meeting.attendees = [ceo, manager];
      await db.save(meeting);
    });
  }
}
