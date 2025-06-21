import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Res,
  Req,
  UseGuards,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { UserEntity } from '../url-shortener/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @ApiBearerAuth('JWT-auth')
  @Post('shorten')
  @UseGuards(OptionalJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createShortUrl(
    @Body() createUrlDto: CreateUrlDto,
    @Req() req: Request & { user?: UserEntity },
  ): Promise<UrlResponseDto> {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return await this.urlService.createShortUrl(createUrlDto, baseUrl, req.user);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('my-urls')
  @UseGuards(JwtAuthGuard)
  async getMyUrls(@Req() req: Request & { user: UserEntity }): Promise<UrlResponseDto[]> {
    return await this.urlService.getUrlsByUser(req.user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @Put('urls/:shortCode')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUrl(
    @Param('shortCode') shortCode: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Req() req: Request & { user: UserEntity },
  ): Promise<UrlResponseDto> {
    return await this.urlService.updateUrl(shortCode, updateUrlDto, req.user);
  }

  @ApiBearerAuth('JWT-auth')
  @Delete('urls/:shortCode')
  @UseGuards(JwtAuthGuard)
  async deleteUrl(
    @Param('shortCode') shortCode: string,
    @Req() req: Request & { user: UserEntity },
  ): Promise<{ message: string }> {
    await this.urlService.deleteUrl(shortCode, req.user);
    return { message: 'URL excluída com sucesso' };
  }

  @Get('stats/:shortCode')
  async getUrlStats(@Param('shortCode') shortCode: string): Promise<UrlResponseDto> {
    return await this.urlService.getUrlStats(shortCode);
  }

  @Get(':shortCode')
  async redirectToOriginal(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const originalUrl = await this.urlService.getOriginalUrl(shortCode);
      res.redirect(HttpStatus.MOVED_PERMANENTLY, originalUrl);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: 404,
        message: 'URL não encontrada',
        error: 'Not Found',
      });
    }
  }
}
