import { BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ItensService } from './itens.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateItemDto, UpdateItemDto } from './dto/itens.dto';
import { diskStorage } from 'multer';
import { processImage } from 'src/utils/process-image';

@Controller('items')
export class ItensController {
  constructor(private readonly itensService: ItensService) { }


  @Get('pagination')
  async pagination(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('titulo', new DefaultValuePipe('')) titulo: string
  ) {
    return await this.itensService.pagination({
      page,
      limit,
      titulo
    });
  }

  @Get('findById/:id')
  async findById(@Param('id') id: string) {
    return this.itensService.findById(id);
  }

  @Get('/:photo')
  getComprovanteDeResidencia(@Param('photo') photo: string, @Res() res) {
    try {

      const image = res.sendFile(photo, {root: './src/itens/uploads/items'});
      return image;
    }
    catch(err) {
      console.log(err);
    }
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './src/itens/uploads/items',
      filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.originalname.replace(/\s|-/g, '_')}`)
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Apenas imagens são permitidas!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // Isso equivale a 5MB
    }
  }))
  async create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    try {

      if(!photo) throw new BadRequestException('Imagem obrigatória');
      
      const processedFilename = await processImage(photo);

      return await this.itensService.create({
        ...createItemDto,
        photoOriginalName: processedFilename
      });
    } catch (error) {
      throw new BadRequestException('Erro ao processar imagem: ' + error.message);
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './src/itens/uploads/items',
      filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.originalname.replace(/\s|-/g, '_')}`)
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Apenas imagens são permitidas!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    }
  }))
  async update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return await this.itensService.update(id, {
      ...updateItemDto,
      ...(photo && {
        photo: photo.buffer,
        photoOriginalName: photo.filename
      })
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.itensService.delete(id);
  }
}
