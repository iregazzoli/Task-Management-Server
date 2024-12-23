import { DataSource } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksRepository {
  private repository;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Task);
  }

  public async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.repository.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
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
