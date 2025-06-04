import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TutorialsService } from "../../tutorials.service";
import { Tutorial } from "../../tutorials.service";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-tutorial-crash-course",
  templateUrl: "./tutorial-crash-course.component.html",
  styleUrls: ["./tutorial-crash-course.component.css"],
  standalone: true,
  imports: [CommonModule, MatButtonModule],
})
export class TutorialCrashCourseComponent implements OnInit {
  @Input() isSettingsComponent: boolean = false;
  showTutorial = false;
  dashboardTutorialId: number | null = null;

  constructor(private tutorialsService: TutorialsService) {}

  ngOnInit(): void {
    this.tutorialsService
      .getByFeature("dashboard_crash_course")
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
