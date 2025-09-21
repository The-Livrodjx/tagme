import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateItemDto {
  @IsString({
    message: 'Título deve ser uma string'
  })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MaxLength(255, { message: 'Título deve ter no máximo 255 caracteres' })
  titulo: string;

  @IsString({
    message: 'Descrição deve ser uma string'
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  descricao: string;

  photo?: Buffer;
  photoOriginalName?: string;
  photoMimeType?: string;
}

export class UpdateItemDto {
  @IsString({ message: 'Título deve ser uma string' })
  @IsOptional()
  @MaxLength(255, { message: 'Título deve ter no máximo 255 caracteres' })
  titulo: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  descricao: string;

  photo?: Buffer;

  photoOriginalName?: string;
}

export interface Item {
  titulo: string;
  descricao: string;
  photo: string;
}

export interface ItemPagination {
  page: number;
  limit: number;
  titulo?: string;
}