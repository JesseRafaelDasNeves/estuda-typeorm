import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEmployeesReportQuery } from './get-employees-report.query';
import { EmployeesReportDto } from './employees-report.dto';
import { DataSource } from 'typeorm';
import { plainToClass } from 'class-transformer';

@QueryHandler(GetEmployeesReportQuery)
export class GetEmployeesReportHandler
  implements IQueryHandler<GetEmployeesReportQuery, EmployeesReportDto[]>
{
  constructor(private readonly dataSource: DataSource) {}
  async execute() {
    const data = await this.dataSource.manager.query('\
        SELECT \
           e.id, \
           e.name, \
           e.managerId, \
           manager.name as managerName, \
           ci.phone, \
           ci.email, \
           COUNT(distinct t.id) as numberOfTasks, \
           COUNT(distinct ma.meetingId) as numberOfMettings \
        FROM employee e \
        LEFT JOIN employee manager ON manager.id = e.managerId \
        LEFT JOIN contact_info ci ON ci.id = e.id \
        LEFT JOIN task t ON t.assigneeId = e.id \
        LEFT JOIN meeting_attendees_employee ma ON ma.employeeId = e.id \
        LEFT JOIN meeting m ON m.id = ma.meetingId \
        GROUP BY e.id, e.name, e.managerId, manager.name, ci.phone, ci.email; \
    ');

    return data.map((row) => plainToClass(EmployeesReportDto, row));
  }
}
