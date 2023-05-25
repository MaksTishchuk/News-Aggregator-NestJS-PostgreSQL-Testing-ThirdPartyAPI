import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api')
    app.enableCors()
    app.useGlobalPipes(new ValidationPipe())

    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('News Aggregator')
      .setDescription('News Aggregator API description')
      .setVersion('1.0')
      .addTag('News Aggregator')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-swagger', app, document)

    const PORT = process.env.PORT || 5000
    await app.listen(PORT, () => console.log(`Server has been started on PORT: ${PORT}!`));
  } catch (error) { console.log(error)}

}
bootstrap();
