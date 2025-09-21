import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { MongooseModule } from '@nestjs/mongoose';
import { ItensModule } from './itens/itens.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost/nest'),
    ItensModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
