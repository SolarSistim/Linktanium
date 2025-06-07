import { Component, OnInit } from "@angular/core";
import { NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { environment } from "../../../environment/environment";
import { HttpClient } from "@angular/common/http";
import { MatFormField } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { SmallTitleComponent } from "../../ui-components/small-title/small-title.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { TutorialsService } from "../tutorials/tutorials.service";
import { TutorialANoteOnImportsComponent } from "../tutorials/tutorial-components/tutorial-a-note-on-imports/tutorial-a-note-on-imports.component";

@Component({
  selector: "app-import-export",
  imports: [
    MatButtonModule,
    MatIconModule,
    NgIf,
    SmallTitleComponent,
    MatProgressSpinner,
    TutorialANoteOnImportsComponent,
  ],
  templateUrl: "./import-export.component.html",
  styleUrl: "./import-export.component.css",
})
export class ImportExportComponent implements OnInit {
  
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  loading = false;
  importing = false;
  showImportTutorial = false;
  tutorialId!: number;

  constructor(
    private http: HttpClient,
    private tutorialsService: TutorialsService
  ) {}

  ngOnInit() {
    this.loadImportExportTutorial();
  }

  loadImportExportTutorial() {
    this.tutorialsService.getByFeature("import_export_help").subscribe({
      next: (tutorial: any) => {
        this.showImportTutorial = tutorial.display;
        this.tutorialId = tutorial.id;
      },
      error: (err: any) => {
        console.warn("Failed to load import/export tutorial setting:", err);
      },
    });
  }

  dontShowAgain() {
    if (!this.tutorialId) return;
    this.tutorialsService.updateDisplay(this.tutorialId, false).subscribe({
      next: () => {
        this.showImportTutorial = false;
      },
      error: (err: any) => {
        console.error("Failed to update import/export tutorial display:", err);
      },
    });
  }

  exportData() {
    this.loading = true;
    const exportUrl = `${environment.apiUrl}/export-full-backup`;
    const anchor = document.createElement("a");
    anchor.href = exportUrl;
    anchor.target = "_blank";
    anchor.click();

    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  importSelectedFile() {
    if (!this.selectedFile) return;

    this.importing = true;
    const formData = new FormData();
    formData.append("file", this.selectedFile);

    this.http
      .post(`${environment.apiUrl}/import-full-backup`, formData)
      .subscribe({
        next: () => {
          alert("Import complete!");
          this.importing = false;
          this.selectedFileName = null;
          this.selectedFile = null;
        },
        error: (err) => {
          console.error("Import error:", err);
          alert("Import failed. Please check the ZIP file and try again.");
          this.importing = false;
        },
      });
  }
}
