import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TutorialsService } from "../../tutorials.service";
import { Tutorial } from "../../tutorials.service";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-tutorial-list",
  imports: [CommonModule, MatButtonModule],
  templateUrl: "./tutorial-list.component.html",
  styleUrl: "./tutorial-list.component.css",
})
export class TutorialListComponent {
  @Input() isSettingsComponent: boolean = false;
  showTutorial = false;
  dashboardTutorialId: number | null = null;

  constructor(private tutorialsService: TutorialsService) {}

  ngOnInit(): void {
    this.tutorialsService
      .getByFeature("tutorial_lists")
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
