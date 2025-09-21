import { Module } from '@nestjs/common';
import { ItensService } from './itens.service';
import { ItensController } from './itens.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './entities/itens.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Item.name,
        schema: ItemSchema
      }
    ]),
    MulterModule.register({
      dest: './uploads/items',
    })
  ],
  controllers: [ItensController],
  providers: [ItensService],
})
export class ItensModule { }
