import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { mockRepository } from '../../testing/mock-repository';
import { pgQueryFailedError } from '../../testing/pg-error';
import { UsersService } from './users.service';
import type { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const sampleUser: User = {
    id: 1,
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    repository = mockRepository<User>();
    service = new UsersService(repository);
  });

  describe('findAll', () => {
    it('returns the standard pagination envelope', async () => {
      vi.mocked(repository.findAndCount).mockResolvedValue([[sampleUser], 21]);

      const result = await service.findAll(3, 10);

      expect(result).toEqual({
        data: [sampleUser],
        total: 21,
        page: 3,
        limit: 10,
        totalPages: 3,
      });
    });

    it('converts page/limit into skip/take', async () => {
      vi.mocked(repository.findAndCount).mockResolvedValue([[], 0]);

      await service.findAll(2, 5);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the user when found', async () => {
      vi.mocked(repository.findOneBy).mockResolvedValue(sampleUser);

      await expect(service.findOne(1)).resolves.toEqual(sampleUser);
    });

    it('throws NotFoundException when missing', async () => {
      vi.mocked(repository.findOneBy).mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('saves and returns the new user', async () => {
      const dto = { email: 'ada@example.com', name: 'Ada Lovelace' };
      vi.mocked(repository.save).mockResolvedValue(sampleUser);

      const result = await service.create(dto);

      expect(result).toEqual(sampleUser);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('maps a unique violation to ConflictException', async () => {
      vi.mocked(repository.save).mockRejectedValue(pgQueryFailedError('23505'));

      await expect(
        service.create({ email: 'ada@example.com', name: 'Ada' }),
      ).rejects.toThrow(ConflictException);
    });

    it('rethrows unrelated repository errors', async () => {
      vi.mocked(repository.save).mockRejectedValue(new Error('boom'));

      await expect(
        service.create({ email: 'x@example.com', name: 'X' }),
      ).rejects.toThrow('boom');
    });
  });

  describe('update', () => {
    it('strips undefined fields and returns the updated user', async () => {
      vi.mocked(repository.update).mockResolvedValue({ affected: 1 } as never);
      vi.mocked(repository.findOneBy).mockResolvedValue(sampleUser);

      const result = await service.update(1, { name: 'Ada K.', email: undefined });

      expect(repository.update).toHaveBeenCalledWith(1, { name: 'Ada K.' });
      expect(result).toEqual(sampleUser);
    });

    it('returns the untouched user when no fields are provided', async () => {
      vi.mocked(repository.findOneBy).mockResolvedValue(sampleUser);

      await service.update(1, {});

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user does not exist', async () => {
      vi.mocked(repository.update).mockResolvedValue({ affected: 0 } as never);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('maps a unique violation on update to ConflictException', async () => {
      vi.mocked(repository.update).mockRejectedValue(pgQueryFailedError('23505'));

      await expect(service.update(1, { email: 'dupe@example.com' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('deletes without error when the user exists', async () => {
      vi.mocked(repository.delete).mockResolvedValue({ affected: 1 } as never);

      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('throws NotFoundException when the user does not exist', async () => {
      vi.mocked(repository.delete).mockResolvedValue({ affected: 0 } as never);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('maps a foreign-key violation to ConflictException', async () => {
      vi.mocked(repository.delete).mockRejectedValue(pgQueryFailedError('23503'));

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
