import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { mockRepository } from '../../testing/mock-repository';
import { pgQueryFailedError } from '../../testing/pg-error';
import { ProjectsService } from './projects.service';
import type { Project } from './project.entity';
import type { User } from '../users/user.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectsRepository: Repository<Project>;
  let usersRepository: Repository<User>;

  const sampleProject: Project = {
    id: 1,
    name: 'Apollo',
    description: null,
    ownerId: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    projectsRepository = mockRepository<Project>();
    usersRepository = mockRepository<User>();
    service = new ProjectsService(projectsRepository, usersRepository);
  });

  describe('findAll', () => {
    it('filters by owner when ownerId is provided', async () => {
      vi.mocked(projectsRepository.findAndCount).mockResolvedValue([[], 0]);

      await service.findAll(1, 10, 7);

      expect(projectsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { ownerId: 7 } }),
      );
    });

    it('uses an empty filter when ownerId is omitted', async () => {
      vi.mocked(projectsRepository.findAndCount).mockResolvedValue([[], 0]);

      await service.findAll(1, 10);

      expect(projectsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('create', () => {
    it('saves the project when the owner exists', async () => {
      vi.mocked(usersRepository.findOneBy).mockResolvedValue({ id: 1 } as User);
      vi.mocked(projectsRepository.save).mockResolvedValue(sampleProject);

      const result = await service.create({ name: 'Apollo', ownerId: 1 });

      expect(result).toEqual(sampleProject);
      expect(projectsRepository.create).toHaveBeenCalledWith({
        name: 'Apollo',
        ownerId: 1,
      });
    });

    it('throws NotFoundException when the owner does not exist', async () => {
      vi.mocked(usersRepository.findOneBy).mockResolvedValue(null);

      await expect(service.create({ name: 'X', ownerId: 99 })).rejects.toThrow(
        NotFoundException,
      );
      expect(projectsRepository.save).not.toHaveBeenCalled();
    });

    it('maps a foreign-key race to NotFoundException', async () => {
      vi.mocked(usersRepository.findOneBy).mockResolvedValue({ id: 1 } as User);
      vi.mocked(projectsRepository.save).mockRejectedValue(
        pgQueryFailedError('23503'),
      );

      await expect(service.create({ name: 'X', ownerId: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('validates a new owner before updating', async () => {
      vi.mocked(usersRepository.findOneBy).mockResolvedValue(null);

      await expect(service.update(1, { ownerId: 99 })).rejects.toThrow(
        NotFoundException,
      );
      expect(projectsRepository.update).not.toHaveBeenCalled();
    });

    it('returns the untouched project when no fields are provided', async () => {
      vi.mocked(projectsRepository.findOneBy).mockResolvedValue(sampleProject);

      await service.update(1, {});

      expect(projectsRepository.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the project does not exist', async () => {
      vi.mocked(projectsRepository.update).mockResolvedValue({
        affected: 0,
      } as never);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the project does not exist', async () => {
      vi.mocked(projectsRepository.delete).mockResolvedValue({
        affected: 0,
      } as never);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
