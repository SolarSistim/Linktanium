import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Patch,
  Body,
  Post,
} from "@nestjs/common";
import { TutorialsService } from "./tutorials.service";
import { Tutorial } from "./tutorials.entity";

@Controller("tutorials")
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get()
  async findAll(): Promise<Tutorial[]> {
    return this.tutorialsService.findAll();
  }

  @Get("feature/:feature")
  async findByFeature(@Param("feature") feature: string): Promise<Tutorial> {
    const tutorial = await this.tutorialsService.findByFeature(feature);
    if (!tutorial) {
      throw new NotFoundException(
        `Tutorial with feature "${feature}" not found`
      );
    }
    return tutorial;
  }

  @Post("toggle-display/:id")
  async toggleDisplayById(
    @Param("id") id: string,
    @Body("display") display: boolean
  ): Promise<any> {
    const updated = await this.tutorialsService.updateDisplay(
      Number(id),
      display
    );
    return { ...updated };
  }

  @Patch("toggle-all")
  async toggleAll(
    @Body("display") display: boolean
  ): Promise<{ updated: number }> {
    const count = await this.tutorialsService.updateAllDisplay(display);
    return { updated: count };
  }
}
