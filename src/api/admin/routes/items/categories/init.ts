import { C } from "ts-toolbelt";
import { schemas } from "models";
import { PartialSchema } from "common/functions";
import { ComponentSchema, Controller } from "aom";
import { BodyBuilder } from "common/controllers";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { Expose } from "class-transformer";

@Controller()
export class AddCategoryRequest extends BodyBuilder(
  schemas.ItemsCategories,
  "Добавить категорию"
) {}

@ComponentSchema()
export class TestBody {
  @IsString()
  @Expose()
  @IsNotEmpty()
  @JSONSchema({ description: "Строка" })
  value1!: string;

  @IsNumber()
  @Expose()
  @IsNotEmpty()
  @JSONSchema({ description: "Число" })
  value2!: number;
}

@Controller()
export class TestBodyRequest extends BodyBuilder(TestBody, "проверка") {}

@ComponentSchema()
export class PatchCategoryBody extends PartialSchema(schemas.ItemsCategories) {}

@Controller()
export class PatchCategoryRequest extends BodyBuilder(PatchCategoryBody) {}
