import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UiListEmbedComponent } from "../../ui-components/ui-list-embed/ui-list-embed.component";
import { SettingsService } from "../../settings-components/app-settings/settings.service";

@Component({
  selector: "app-list-full",
  standalone: true,
  imports: [CommonModule, UiListEmbedComponent],
  templateUrl: "./list-full.component.html",
  styleUrl: "./list-full.component.css",
})
export class ListFullComponent implements OnInit {
  groupBackgroundColor: string = "#2e3a46";
  listId!: number;

  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get("id");
      this.listId = idParam ? +idParam : 0;
    });

    this.settingsService.getSettingByKey("GROUP_BACKGROUND_COLOR").subscribe({
      next: (value) => {
        this.groupBackgroundColor = value || "#2e3a46";
      },
      error: (err) => {
        console.warn("Failed to load GROUP_BACKGROUND_COLOR setting:", err);
      },
    });
  }
}
