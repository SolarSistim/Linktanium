import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TutorialsService } from "../../tutorials.service";
import { Tutorial } from "../../tutorials.service";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-tutorial-a-note-on-imports",
  imports: [CommonModule, MatButtonModule],
  templateUrl: "./tutorial-a-note-on-imports.component.html",
  styleUrl: "./tutorial-a-note-on-imports.component.css",
})
export class TutorialANoteOnImportsComponent {
  
  @Input() isSettingsComponent: boolean = false;
  showTutorial = false;
  dashboardTutorialId: number | null = null;

  constructor(private tutorialsService: TutorialsService) {}

  ngOnInit(): void {
    this.tutorialsService
      .getByFeature("import_export_help")
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
