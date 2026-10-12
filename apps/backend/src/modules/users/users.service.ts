import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Paginated } from '@ai-workflow/shared-types';
import { buildPaginated } from '../../common/pagination';
import { isForeignKeyViolation, isUniqueViolation } from '../../common/postgres-error.util';
import { stripUndefined } from '../../common/object.util';
import type { CreateUserDto } from './dtos/create-user.dto';
import type { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';

/**
 * CRUD for users. Pagination envelope matches Paginated<User> from
 * @ai-workflow/shared-types.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(page: number, limit: number): Promise<Paginated<User>> {
    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });
    return buildPaginated(data, total, page, limit);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    try {
      return await this.usersRepository.save(this.usersRepository.create(dto));
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(`Email "${dto.email}" is already registered`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const changes = stripUndefined(dto);
    if (Object.keys(changes).length === 0) {
      return this.findOne(id);
    }
    try {
      const updated = await this.usersRepository.update(id, changes);
      if (updated.affected === 0) {
        throw new NotFoundException(`User #${id} not found`);
      }
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(`Email is already registered`);
      }
      throw error;
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`User #${id} not found`);
      }
    } catch (error: unknown) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          `User #${id} still owns projects or is assigned to tasks`,
        );
      }
      throw error;
    }
  }
}
