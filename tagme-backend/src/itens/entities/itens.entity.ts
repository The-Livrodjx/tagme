import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Item extends Document {

  @Prop()
  titulo: string;

  @Prop()
  descricao: string;

  @Prop()
  photo: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
