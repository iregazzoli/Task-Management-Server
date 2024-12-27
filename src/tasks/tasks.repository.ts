import { DataSource } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksRepository {
  private repository;
  private logger = new Logger('TasksRepository', { timestamp: true });

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Task);
  }

  public async getTasks(
    filterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.repository.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.repository.save(task);
    return task;
  }

  async findOne(options: any): Promise<Task | null> {
    return this.repository.findOne(options);
  }

  async delete(criteria: any): Promise<any> {
    return this.repository.delete(criteria);
  }

  async save(task: Task): Promise<Task> {
    return this.repository.save(task);
  }
}
