import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import type { Paginated } from '@ai-workflow/shared-types';
import { TaskStatus } from '@ai-workflow/shared-types';
import { buildPaginated } from '../../common/pagination';
import { stripUndefined } from '../../common/object.util';
import type { CreateTaskDto } from './dtos/create-task.dto';
import type { UpdateTaskDto } from './dtos/update-task.dto';
import { Task } from './task.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

/**
 * CRUD for tasks. Creating/updating validates that the referenced
 * project and assignee exist; the database foreign keys remain the
 * final safety net.
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    filters: { projectId?: number; status?: TaskStatus; assigneeId?: number } = {},
  ): Promise<Paginated<Task>> {
    const where: FindOptionsWhere<Task> = {};
    if (filters.projectId !== undefined) {
      where.projectId = filters.projectId;
    }
    if (filters.status !== undefined) {
      where.status = filters.status;
    }
    if (filters.assigneeId !== undefined) {
      where.assigneeId = filters.assigneeId;
    }
    const [data, total] = await this.tasksRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });
    return buildPaginated(data, total, page, limit);
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    await this.assertProjectExists(dto.projectId);
    if (dto.assigneeId != null) {
      await this.assertAssigneeExists(dto.assigneeId);
    }
    return this.tasksRepository.save(
      this.tasksRepository.create({
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? TaskStatus.TODO,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId ?? null,
      }),
    );
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const changes = stripUndefined(dto);
    if (changes.assigneeId !== undefined && changes.assigneeId !== null) {
      await this.assertAssigneeExists(changes.assigneeId);
    }
    if (Object.keys(changes).length === 0) {
      return this.findOne(id);
    }
    const updated = await this.tasksRepository.update(id, changes);
    if (updated.affected === 0) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task #${id} not found`);
    }
  }

  private async assertProjectExists(projectId: number): Promise<void> {
    const project = await this.projectsRepository.findOneBy({ id: projectId });
    if (!project) {
      throw new NotFoundException(`Project #${projectId} not found`);
    }
  }

  private async assertAssigneeExists(assigneeId: number): Promise<void> {
    const assignee = await this.usersRepository.findOneBy({ id: assigneeId });
    if (!assignee) {
      throw new NotFoundException(`Assignee #${assigneeId} not found`);
    }
  }
}
