import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SettingsService } from "./settings-components/app-settings/settings.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.loadSettings().subscribe((settings) => {
      if (settings["PAGE_TITLE"]) {
        document.title = settings["PAGE_TITLE"];
      }

      const bgType = settings["GLOBAL_BACKGROUND_TYPE"]?.toUpperCase();
      const bgColor = settings["GLOBAL_BACKGROUND_COLOR"];
      const bgImage = settings["GLOBAL_BACKGROUND_IMAGE"];

      const body = document.body;
      if (bgType === "COLOR" && bgColor) {
        body.style.backgroundColor = bgColor;
        body.style.backgroundImage = "";
      } else if (bgType === "IMAGE" && bgImage) {
        body.style.backgroundImage = `url('/assets/theme/background/${bgImage}')`;
        body.style.backgroundColor = "";
        body.style.backgroundSize = "cover";
        body.style.backgroundRepeat = "no-repeat";
        body.style.backgroundPosition = "center center";
        body.style.backgroundAttachment = "fixed";
      }
    });
  }
}
