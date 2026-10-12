import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { TaskStatus } from '@ai-workflow/shared-types';
import { mockRepository } from '../../testing/mock-repository';
import { TasksService } from './tasks.service';
import type { Task } from './task.entity';
import type { Project } from '../projects/project.entity';
import type { User } from '../users/user.entity';

describe('TasksService', () => {
  let service: TasksService;
  let tasksRepository: Repository<Task>;
  let projectsRepository: Repository<Project>;
  let usersRepository: Repository<User>;

  const sampleTask: Task = {
    id: 1,
    title: 'Design schema',
    description: null,
    status: TaskStatus.TODO,
    projectId: 1,
    assigneeId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    tasksRepository = mockRepository<Task>();
    projectsRepository = mockRepository<Project>();
    usersRepository = mockRepository<User>();
    service = new TasksService(tasksRepository, projectsRepository, usersRepository);
  });

  describe('findAll', () => {
    it('passes provided filters into the where clause', async () => {
      vi.mocked(tasksRepository.findAndCount).mockResolvedValue([[], 0]);

      await service.findAll(1, 10, {
        projectId: 2,
        status: TaskStatus.DONE,
        assigneeId: 3,
      });

      expect(tasksRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 2, status: TaskStatus.DONE, assigneeId: 3 },
        }),
      );
    });

    it('uses an empty filter when none are provided', async () => {
      vi.mocked(tasksRepository.findAndCount).mockResolvedValue([[], 0]);

      await service.findAll(1, 10);

      expect(tasksRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('create', () => {
    it('defaults status to TODO and description to null', async () => {
      vi.mocked(projectsRepository.findOneBy).mockResolvedValue({ id: 1 } as Project);
      vi.mocked(tasksRepository.save).mockResolvedValue(sampleTask);

      await service.create({ title: 'Design schema', projectId: 1 });

      expect(tasksRepository.create).toHaveBeenCalledWith({
        title: 'Design schema',
        description: null,
        status: TaskStatus.TODO,
        projectId: 1,
        assigneeId: null,
      });
    });

    it('throws NotFoundException when the project does not exist', async () => {
      vi.mocked(projectsRepository.findOneBy).mockResolvedValue(null);

      await expect(
        service.create({ title: 'X', projectId: 99 }),
      ).rejects.toThrow(NotFoundException);
      expect(tasksRepository.save).not.toHaveBeenCalled();
    });

    it('validates the assignee when provided', async () => {
      vi.mocked(projectsRepository.findOneBy).mockResolvedValue({ id: 1 } as Project);
      vi.mocked(usersRepository.findOneBy).mockResolvedValue(null);

      await expect(
        service.create({ title: 'X', projectId: 1, assigneeId: 42 }),
      ).rejects.toThrow(NotFoundException);
      expect(tasksRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('allows unassigning with an explicit null without validating', async () => {
      vi.mocked(tasksRepository.update).mockResolvedValue({ affected: 1 } as never);
      vi.mocked(tasksRepository.findOneBy).mockResolvedValue(sampleTask);

      await service.update(1, { assigneeId: null });

      expect(usersRepository.findOneBy).not.toHaveBeenCalled();
      expect(tasksRepository.update).toHaveBeenCalledWith(1, { assigneeId: null });
    });

    it('validates a new assignee when provided', async () => {
      vi.mocked(usersRepository.findOneBy).mockResolvedValue(null);

      await expect(service.update(1, { assigneeId: 42 })).rejects.toThrow(
        NotFoundException,
      );
      expect(tasksRepository.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the task does not exist', async () => {
      vi.mocked(tasksRepository.update).mockResolvedValue({ affected: 0 } as never);

      await expect(service.update(99, { title: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the untouched task when no fields are provided', async () => {
      vi.mocked(tasksRepository.findOneBy).mockResolvedValue(sampleTask);

      await service.update(1, {});

      expect(tasksRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the task does not exist', async () => {
      vi.mocked(tasksRepository.delete).mockResolvedValue({ affected: 0 } as never);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
