import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { UrlEntity } from './entities/url.entity';
import * as crypto from 'crypto';
import { UserEntity } from '../url-shortener/entities/user.entity';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(UrlEntity)
    private readonly urlRepository: Repository<UrlEntity>,
  ) {}

  async createShortUrl(
    createUrlDto: CreateUrlDto,
    baseUrl: string,
    user?: UserEntity,
  ): Promise<UrlResponseDto> {
    const { originalUrl, customAlias } = createUrlDto;

    const whereCondition: any = {
      originalUrl,
      isActive: true,
      deletedAt: IsNull(),
    };

    if (user) {
      whereCondition.userId = user.id;
    } else {
      whereCondition.userId = IsNull();
    }

    const existingUrl = await this.urlRepository.findOne({
      where: whereCondition,
      relations: ['user'],
    });

    if (existingUrl) {
      return this.buildResponse(existingUrl, baseUrl);
    }

    let shortCode: string;

    if (customAlias) {
      const existingAlias = await this.urlRepository.findOne({
        where: { shortCode: customAlias, deletedAt: IsNull() },
      });

      if (existingAlias) {
        throw new BadRequestException('Alias personalizado já está em uso');
      }
      shortCode = customAlias;
    } else {
      shortCode = await this.generateUniqueShortCode();
    }

    const urlEntity = this.urlRepository.create({
      originalUrl,
      shortCode,
      clicks: 0,
      isActive: true,
      userId: user?.id,
    });

    const savedUrl = await this.urlRepository.save(urlEntity);

    const urlWithUser = await this.urlRepository.findOne({
      where: { id: savedUrl.id },
      relations: ['user'],
    });

    return this.buildResponse(urlWithUser!, baseUrl);
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    const urlEntity = await this.urlRepository.findOne({
      where: {
        shortCode,
        isActive: true,
        deletedAt: IsNull(),
      },
    });

    if (!urlEntity) {
      throw new NotFoundException('URL encurtada não encontrada ou expirada');
    }

    if (urlEntity.expiresAt && urlEntity.expiresAt < new Date()) {
      await this.urlRepository.update(urlEntity.id, { isActive: false });
      throw new NotFoundException('URL encurtada expirou');
    }

    await this.urlRepository.increment({ id: urlEntity.id }, 'clicks', 1);

    return urlEntity.originalUrl;
  }

  async getUrlsByUser(userId: string): Promise<UrlResponseDto[]> {
    const urls = await this.urlRepository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return urls.map(url => this.buildResponse(url, 'http://localhost:3000'));
  }

  async updateUrl(shortCode: string, updateUrlDto: UpdateUrlDto, user: UserEntity): Promise<UrlResponseDto> {
    const urlEntity = await this.urlRepository.findOne({
      where: {
        shortCode,
        deletedAt: IsNull(),
      },
      relations: ['user'],
    });

    if (!urlEntity) {
      throw new NotFoundException('URL não encontrada');
    }

    if (urlEntity.userId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para editar esta URL');
    }

    await this.urlRepository.update(urlEntity.id, {
      originalUrl: updateUrlDto.originalUrl,
    });

    const updatedUrl = await this.urlRepository.findOne({
      where: { id: urlEntity.id },
      relations: ['user'],
    });

    return this.buildResponse(updatedUrl!, 'http://localhost:3000');
  }

  async deleteUrl(shortCode: string, user: UserEntity): Promise<void> {
    const urlEntity = await this.urlRepository.findOne({
      where: {
        shortCode,
        deletedAt: IsNull(),
      },
    });

    if (!urlEntity) {
      throw new NotFoundException('URL não encontrada');
    }

    if (urlEntity.userId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para excluir esta URL');
    }

    await this.urlRepository.update(urlEntity.id, {
      deletedAt: new Date(),
      isActive: false,
    });
  }

  async getUrlStats(shortCode: string): Promise<UrlResponseDto> {
    const urlEntity = await this.urlRepository.findOne({
      where: { shortCode, deletedAt: IsNull() },
      relations: ['user'],
    });

    if (!urlEntity) {
      throw new NotFoundException('URL encurtada não encontrada');
    }

    return this.buildResponse(urlEntity, 'http://localhost:3000');
  }

  private async generateUniqueShortCode(length: number = 6): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode: string;
    let isUnique = false;

    do {
      shortCode = '';
      for (let i = 0; i < length; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await this.urlRepository.findOne({
        where: { shortCode, deletedAt: IsNull() },
      });

      isUnique = !existing;
    } while (!isUnique);

    return shortCode;
  }

  private buildResponse(urlEntity: UrlEntity, baseUrl: string): UrlResponseDto {
    return {
      id: urlEntity.id,
      originalUrl: urlEntity.originalUrl,
      shortUrl: `${baseUrl}/${urlEntity.shortCode}`,
      shortCode: urlEntity.shortCode,
      clicks: urlEntity.clicks,
      createdAt: urlEntity.createdAt,
      updatedAt: urlEntity.updatedAt,
      expiresAt: urlEntity.expiresAt,
      userId: urlEntity.userId,
      user: urlEntity.user ? {
        id: urlEntity.user.id,
        name: urlEntity.user.name,
        email: urlEntity.user.email,
      } : undefined,
    };
  }
}
