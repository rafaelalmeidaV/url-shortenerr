import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { UserEntity } from './entities/user.entity';

describe('UrlController', () => {
  let controller: UrlController;
  let urlService: UrlService;

  const mockUrlService = {
    createShortUrl: jest.fn(),
    getUrlsByUser: jest.fn(),
    updateUrl: jest.fn(),
    deleteUrl: jest.fn(),
    getUrlStats: jest.fn(),
    getOriginalUrl: jest.fn(),
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

  const mockUrlResponse: UrlResponseDto = {
    id: 'url-uuid-123',
    originalUrl: 'https://www.google.com',
    shortUrl: 'http://localhost:3000/abc123',
    shortCode: 'abc123',
    clicks: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: mockUser.id,
    user: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShortUrl', () => {
    it('should create short URL', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://www.google.com',
      };
      const mockReq = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
        user: mockUser,
      } as any;

      mockUrlService.createShortUrl.mockResolvedValue(mockUrlResponse);

      const result = await controller.createShortUrl(createUrlDto, mockReq);

      expect(urlService.createShortUrl).toHaveBeenCalledWith(
        createUrlDto,
        'http://localhost:3000',
        mockUser,
      );
      expect(result).toEqual(mockUrlResponse);
    });
  });

  describe('getMyUrls', () => {
    it('should return user URLs', async () => {
      const mockReq = { user: mockUser } as any;
      mockUrlService.getUrlsByUser.mockResolvedValue([mockUrlResponse]);

      const result = await controller.getMyUrls(mockReq);

      expect(urlService.getUrlsByUser).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([mockUrlResponse]);
    });
  });

  describe('redirectToOriginal', () => {
    it('should redirect to original URL', async () => {
      const mockRes = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      mockUrlService.getOriginalUrl.mockResolvedValue('https://www.google.com');

      await controller.redirectToOriginal('abc123', mockRes);

      expect(urlService.getOriginalUrl).toHaveBeenCalledWith('abc123');
      expect(mockRes.redirect).toHaveBeenCalledWith(
        HttpStatus.MOVED_PERMANENTLY,
        'https://www.google.com',
      );
    });

    it('should return 404 for non-existent URL', async () => {
      const mockRes = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      mockUrlService.getOriginalUrl.mockRejectedValue(new Error('Not found'));

      await controller.redirectToOriginal('nonexistent', mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'URL não encontrada',
        error: 'Not Found',
      });
    });
  });
});
