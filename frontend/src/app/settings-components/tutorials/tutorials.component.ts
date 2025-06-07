import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { HttpClient } from "@angular/common/http";
import { TutorialsService } from "./tutorials.service";
import { UiStatusComponent } from "../../ui-components/ui-status/ui-status.component";
import { StatusMessageService } from "../../ui-components/ui-status/ui-status.service";
import { TutorialANoteOnImportsComponent } from "./tutorial-components/tutorial-a-note-on-imports/tutorial-a-note-on-imports.component";
import { TutorialCrashCourseComponent } from "./tutorial-components/tutorial-crash-course/tutorial-crash-course.component";
import { TutorialCustomizingYourThemeComponent } from "./tutorial-components/tutorial-customizing-your-theme/tutorial-customizing-your-theme.component";
import { TutorialNoteOnIconsComponent } from "./tutorial-components/tutorial-note-on-icons/tutorial-note-on-icons.component";
import { TutorialSearchBarComponent } from "./tutorial-components/tutorial-search-bar/tutorial-search-bar.component";
import { TutorialIconProducerComponent } from "./tutorial-components/tutorial-icon-producer/tutorial-icon-producer.component";
import { TutorialMultiIconUploaderComponent } from "./tutorial-components/tutorial-multi-icon-uploader/tutorial-multi-icon-uploader.component";
import { TutorialListComponent } from "./tutorial-components/tutorial-list/tutorial-list.component";

@Component({
  selector: "app-tutorials",
  imports: [
    MatButtonModule,
    UiStatusComponent,
    TutorialCrashCourseComponent,
    TutorialANoteOnImportsComponent,
    TutorialCustomizingYourThemeComponent,
    TutorialNoteOnIconsComponent,
    TutorialSearchBarComponent,
    TutorialIconProducerComponent,
    TutorialMultiIconUploaderComponent,
    TutorialListComponent,
  ],
  templateUrl: "./tutorials.component.html",
  styleUrl: "./tutorials.component.css",
})
export class TutorialsComponent {
  constructor(
    private tutorialsService: TutorialsService,
    private statusService: StatusMessageService
  ) {}

  disableAll() {
    this.statusService.show("Disabling tutorials...", "loading", false, 1000); // 1 second loading

    this.tutorialsService.toggleAllTutorials(false).subscribe({
      next: () => {
        setTimeout(() => {
          this.statusService.show(
            "All tutorials disabled",
            "success",
            false,
            3000
          );
        }, 1000);
      },
      error: () => {
        setTimeout(() => {
          this.statusService.show(
            "Failed to disable tutorials",
            "error",
            false,
            3000
          );
        }, 1000);
      },
    });
  }

  enableAll() {
    this.statusService.show("Enabling tutorials...", "loading", false, 1000);

    this.tutorialsService.toggleAllTutorials(true).subscribe({
      next: () => {
        setTimeout(() => {
          this.statusService.show(
            "All tutorials enabled",
            "success",
            false,
            3000
          );
        }, 1000);
      },
      error: () => {
        setTimeout(() => {
          this.statusService.show(
            "Failed to enable tutorials",
            "error",
            false,
            3000
          );
        }, 1000);
      },
    });
  }
}
