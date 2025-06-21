import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlEntity } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UserEntity } from '../url-shortener/entities/user.entity';

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: Repository<UrlEntity>;

  const mockUrlRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
  };

  const mockUser: UserEntity = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    isActive: true,
    deletedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    urls: [],
  };

  const mockUrl: UrlEntity = {
    id: 'url-uuid-123',
    originalUrl: 'https://www.google.com',
    shortCode: 'abc123',
    clicks: 0,
    isActive: true,
    expiresAt: undefined,
    deletedAt: undefined,
    userId: 'user-uuid-123',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(UrlEntity),
          useValue: mockUrlRepository,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlRepository = module.get<Repository<UrlEntity>>(getRepositoryToken(UrlEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShortUrl', () => {
    const createUrlDto: CreateUrlDto = {
      originalUrl: 'https://www.google.com',
    };

    it('should create a new short URL for authenticated user', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(mockUrl);
      mockUrlRepository.save.mockResolvedValue(mockUrl);
      mockUrlRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUrl);

      const result = await service.createShortUrl(createUrlDto, 'http://localhost:3000', mockUser);

      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: createUrlDto.originalUrl,
        shortCode: expect.any(String),
        clicks: 0,
        isActive: true,
        userId: mockUser.id,
      });
      expect(result.originalUrl).toBe(createUrlDto.originalUrl);
      expect(result.userId).toBe(mockUser.id);
    });

    it('should throw BadRequestException for existing custom alias', async () => {
      const createUrlDtoWithAlias: CreateUrlDto = {
        originalUrl: 'https://www.google.com',
        customAlias: 'existing',
      };
      mockUrlRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUrl);

      await expect(
        service.createShortUrl(createUrlDtoWithAlias, 'http://localhost:3000', mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return original URL and increment clicks', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);

      const result = await service.getOriginalUrl('abc123');

      expect(result).toBe(mockUrl.originalUrl);
      expect(mockUrlRepository.increment).toHaveBeenCalledWith(
        { id: mockUrl.id },
        'clicks',
        1,
      );
    });

    it('should throw NotFoundException for non-existent URL', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.getOriginalUrl('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for expired URL', async () => {
      const expiredUrl = { ...mockUrl, expiresAt: new Date('2020-01-01') };
      mockUrlRepository.findOne.mockResolvedValue(expiredUrl);

      await expect(service.getOriginalUrl('abc123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUrl', () => {
    const updateUrlDto: UpdateUrlDto = {
      originalUrl: 'https://www.newexample.com',
    };

    it('should update URL for owner', async () => {
      mockUrlRepository.findOne.mockResolvedValueOnce(mockUrl).mockResolvedValueOnce({
        ...mockUrl,
        originalUrl: updateUrlDto.originalUrl,
      });
      mockUrlRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateUrl('abc123', updateUrlDto, mockUser);

      expect(mockUrlRepository.update).toHaveBeenCalledWith(mockUrl.id, {
        originalUrl: updateUrlDto.originalUrl,
      });
      expect(result.originalUrl).toBe(updateUrlDto.originalUrl);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id' };
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);

      await expect(
        service.updateUrl('abc123', updateUrlDto, otherUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteUrl', () => {
    it('should soft delete URL for owner', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);
      mockUrlRepository.update.mockResolvedValue({ affected: 1 });

      await service.deleteUrl('abc123', mockUser);

      expect(mockUrlRepository.update).toHaveBeenCalledWith(mockUrl.id, {
        deletedAt: expect.any(Date),
        isActive: false,
      });
    });

    it('should throw ForbiddenException for non-owner', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id' };
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);

      await expect(service.deleteUrl('abc123', otherUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
