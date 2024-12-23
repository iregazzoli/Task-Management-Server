import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository,
  ) {
    console.log(this.tasksRepository);
  }

  getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto);
  }

  async getTaskById(id: string): Promise<Task> {
    const found = await this.tasksRepository.findOne({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException();
    }

    return found;
  }

  createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksRepository.createTask(createTaskDto);
  }

  async updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const task: Task = await this.getTaskById(id);

    task.status = updateTaskStatusDto.status;
    await this.tasksRepository.save(task);

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);

    if (result.affected === 0)
      throw new NotFoundException(`Task with ID ${id} not found`);
  }
}
