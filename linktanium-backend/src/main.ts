import * as path from "path";
import * as dotenv from "dotenv";


const envFile =
  process.env.NODE_ENV === "production" ? "production.env" : "production.env";
const envPath = path.resolve(__dirname, envFile);
dotenv.config({ path: envPath });

console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log(`📦 Loaded env from: ${envPath}`);
console.log("📂 BRANDING_PATH:", process.env.BRANDING_PATH);
console.log("📂 BACKGROUND_PATH:", process.env.BACKGROUND_PATH);

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV === "production") {
    app.enableCors({
      origin: process.env.ORIGIN,
      credentials: true,
    });
  } else {
    app.enableCors();
  }
  app.setGlobalPrefix("api");

  const brandingDir = path.join(process.cwd(), process.env.BRANDING_PATH!);
  const backgroundDir = path.join(process.cwd(), process.env.BACKGROUND_PATH!);
  app.use("/assets/branding", express.static(brandingDir));
  app.use("/assets/theme/background", express.static(backgroundDir));

  if (process.env.NODE_ENV === "production") {
    const angularDistPath = path.join(__dirname, "..", "frontend");
    app.use(express.static(angularDistPath));

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(angularDistPath, "index.html"));
    });
  }

  const port = Number(process.env.PORT) || 3692;
  console.log("🚀 Starting server on port:", port);
  await app.listen(port);
}

bootstrap();
