import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Paginated } from '@ai-workflow/shared-types';
import { buildPaginated } from '../../common/pagination';
import { isForeignKeyViolation } from '../../common/postgres-error.util';
import { stripUndefined } from '../../common/object.util';
import type { FindOptionsWhere } from 'typeorm';
import type { CreateProjectDto } from './dtos/create-project.dto';
import type { UpdateProjectDto } from './dtos/update-project.dto';
import { Project } from './project.entity';
import { User } from '../users/user.entity';

/**
 * CRUD for projects. The owner must reference an existing user;
 * referential integrity is enforced both here (clear 404) and by the
 * database migration's foreign keys.
 */
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    ownerId?: number,
  ): Promise<Paginated<Project>> {
    const where: FindOptionsWhere<Project> = {};
    if (ownerId !== undefined) {
      where.ownerId = ownerId;
    }
    const [data, total] = await this.projectsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });
    return buildPaginated(data, total, page, limit);
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepository.findOneBy({ id });
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    return project;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    await this.assertOwnerExists(dto.ownerId);
    try {
      return await this.projectsRepository.save(
        this.projectsRepository.create(dto),
      );
    } catch (error: unknown) {
      if (isForeignKeyViolation(error)) {
        // Owner was deleted between the check and the insert.
        throw new NotFoundException(`Owner #${dto.ownerId} not found`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const changes = stripUndefined(dto);
    if (changes.ownerId !== undefined) {
      await this.assertOwnerExists(changes.ownerId);
    }
    if (Object.keys(changes).length === 0) {
      return this.findOne(id);
    }
    try {
      const updated = await this.projectsRepository.update(id, changes);
      if (updated.affected === 0) {
        throw new NotFoundException(`Project #${id} not found`);
      }
    } catch (error: unknown) {
      if (isForeignKeyViolation(error)) {
        throw new NotFoundException(`Owner not found`);
      }
      throw error;
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Tasks cascade via the migration's ON DELETE CASCADE.
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project #${id} not found`);
    }
  }

  private async assertOwnerExists(ownerId: number): Promise<void> {
    const owner = await this.usersRepository.findOneBy({ id: ownerId });
    if (!owner) {
      throw new NotFoundException(`Owner #${ownerId} not found`);
    }
  }
}
