import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TutorialsService } from "../../tutorials.service";
import { Tutorial } from "../../tutorials.service";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-tutorial-note-on-icons",
  imports: [CommonModule, MatButtonModule],
  templateUrl: "./tutorial-note-on-icons.component.html",
  styleUrl: "./tutorial-note-on-icons.component.css",
})
export class TutorialNoteOnIconsComponent {
  @Input() isSettingsComponent: boolean = false;
  showTutorial = false;
  dashboardTutorialId: number | null = null;

  constructor(private tutorialsService: TutorialsService) {}

  ngOnInit(): void {
    this.tutorialsService
      .getByFeature("icon_upload_help")
      .subscribe((tutorial) => {
        this.showTutorial = tutorial.display;
        this.dashboardTutorialId = tutorial.id;
      });
  }

  dismissTutorial(): void {
    if (this.dashboardTutorialId !== null) {
      this.tutorialsService
        .updateDisplay(this.dashboardTutorialId, false)
        .subscribe(() => {
          this.showTutorial = false;
        });
    }
  }
}
