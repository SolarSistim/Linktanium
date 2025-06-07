import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { StatusMessageService } from "../../ui-components/ui-status/ui-status.service";
import { UiStatusComponent } from "../../ui-components/ui-status/ui-status.component";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { ViewChild, ElementRef } from "@angular/core";
import { SmallTitleComponent } from "../../ui-components/small-title/small-title.component";
import { SettingsService } from "../app-settings/settings.service";
import { ColorPickerComponent, ColorPickerDirective } from "ngx-color-picker";
import { ThemesService } from "./themes.service";
import { DialogNameThemeComponent } from "./dialog-name-theme/dialog-name-theme.component";
import { MatDialog } from "@angular/material/dialog";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { DialogManageBackgroundImagesComponent } from "./dialog-manage-background-images/dialog-manage-background-images.component";
import { TutorialsService } from "../tutorials/tutorials.service";
import { TutorialCustomizingYourThemeComponent } from "../tutorials/tutorial-components/tutorial-customizing-your-theme/tutorial-customizing-your-theme.component";

interface ThemePreset {
  name: string;
  [key: string]: any;
}

@Component({
  selector: "app-themes",
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    UiStatusComponent,
    MatCardModule,
    SmallTitleComponent,
    ColorPickerDirective,
    TutorialCustomizingYourThemeComponent,
  ],
  templateUrl: "./themes.component.html",
  styleUrl: "./themes.component.css",
})
export class ThemesComponent {
  @ViewChild("fileInputLogo") fileInputLogo!: ElementRef<HTMLInputElement>;

  themePresets: ThemePreset[] = [];
  selectedThemeName: string = "";
  showThemeTutorial = false;
  themeTutorialId: number | null = null;
  changed = false;
  formValues: Record<string, string> = {};
  originalValues: Record<string, string> = {};
  showLogo = false;
  color: any;
  backgroundImageLoadError = false;
  missingBackgroundImageName: string | null = null;

  private tutorialService = inject(TutorialsService);

  constructor(
    private settingsService: SettingsService,
    private statusService: StatusMessageService,
    private themesService: ThemesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.settingsService.loadSettings().subscribe((settings) => {
      const parsed: Record<string, any> = {};
      for (const key in settings) {
        const val = settings[key];
        if (
          [
            "SEARCH_FEATURE_BACKGROUND_OPACITY",
            "GROUP_BACKGROUND_OPACITY",
            "LINK_BACKGROUND_OPACITY",
          ].includes(key)
        ) {
          const num = parseFloat(val);
          parsed[key] = !isNaN(num) ? num.toFixed(1) : "1.0";
        } else if (
          [
            "CATEGORY_FONT_WEIGHT",
            "CATEGORY_FONT_SIZE",
            "GROUP_FONT_WEIGHT",
            "GROUP_FONT_SIZE",
            "GROUP_BORDER_WIDTH",
            "LINK_FONT_WEIGHT",
            "LINK_FONT_SIZE",
            "LIST_FONT_WEIGHT",
            "LIST_FONT_SIZE",
            "SEARCH_FEATURE_BORDER_WIDTH",
          ].includes(key)
        ) {
          const num = parseInt(val, 10);
          parsed[key] = !isNaN(num) ? num : null;
        } else {
          parsed[key] = val;
        }
      }
      this.formValues = { ...parsed };
      this.originalValues = { ...parsed };
    });

    this.themesService.loadThemes().subscribe((themes) => {
      this.themePresets = themes.map((t) => ({
        name: t.name,
        ...JSON.parse(t.data),
      }));

      const currentThemeMatch = this.themePresets.find((preset) => {
        return Object.entries(preset).every(([key, val]) => {
          return key === "name" || this.formValues[key] === val;
        });
      });

      if (currentThemeMatch) {
        this.selectedThemeName = currentThemeMatch.name;
      } else {
        this.selectedThemeName = "Unsaved Theme";
      }
    });
    this.loadThemeEditorTutorial();
  }

  loadThemeEditorTutorial() {
    this.tutorialService.getByFeature("themes_feature_help").subscribe({
      next: (tutorial: any) => {
        this.showThemeTutorial = tutorial.display;
        this.themeTutorialId = tutorial.id;
      },
      error: (err: any) => {
        console.warn("Failed to load theme tutorial setting:", err);
      },
    });
  }

  dismissThemeTutorial() {
    if (this.themeTutorialId !== null) {
      this.tutorialService
        .updateDisplay(this.themeTutorialId, false)
        .subscribe({
          next: () => {
            this.showThemeTutorial = false;
          },
          error: (err: any) => {
            console.error("Failed to update theme tutorial display:", err);
          },
        });
    }
  }

  handleMissingImage(filename: string | null) {
    this.backgroundImageLoadError = true;
    this.missingBackgroundImageName = filename;
  }

  openManageBackgroundImagesDialog(): void {
    const dialogRef = this.dialog.open(DialogManageBackgroundImagesComponent, {
      width: "800px",
      maxWidth: "unset",
      autoFocus: false,
    });

    dialogRef
      .afterClosed()
      .subscribe((selectedFilename: string | undefined) => {
        if (selectedFilename) {
          this.formValues["GLOBAL_BACKGROUND_IMAGE"] = selectedFilename;
          this.previewUrls[
            "GLOBAL_BACKGROUND_IMAGE"
          ] = `assets/theme/background/${selectedFilename}`;
          this.onValueChange();
        }
      });
  }

  async importThemeFromZip(file: File) {
    const zip = await JSZip.loadAsync(file);

    const themeJson = await zip.file("theme.json")?.async("string");
    if (!themeJson) throw new Error("theme.json not found in ZIP.");

    const parsed = JSON.parse(themeJson);
    const data = parsed.data;
    const name = parsed.name || "Unnamed Theme";

    for (const [key, filename] of Object.entries(data)) {
      if (
        ["FAVICON_IMAGE", "LOGO_IMAGE", "GLOBAL_BACKGROUND_IMAGE"].includes(
          key
        ) &&
        typeof filename === "string" &&
        filename.trim() !== ""
      ) {
        const imageFile = zip.file(`${filename}`);
        if (imageFile) {
          const blob = await imageFile.async("blob");
          const formData = new FormData();
          formData.append("file", blob, filename);
          formData.append("key", key);
          const result = await this.themesService
            .uploadThemeImage(formData)
            .toPromise();
        } else {
          console.warn(`⚠️ Image file not found in ZIP: images/${filename}`);
        }
      }
    }

    this.themesService.saveTheme(name, data).subscribe(() => {
      this.statusService.show("Theme imported!", "success");
      this.settingsService.clearCache?.();
      this.ngOnInit();
    });
  }

  importTheme() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";

    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          await this.importThemeFromZip(file);
        } catch (err) {
          this.statusService.show("Failed to import theme ZIP.", "error");
        }
      }
    };

    input.click();
  }

  applyTheme(themeName: string) {
    const selected = this.themePresets.find((t) => t.name === themeName);
    if (!selected) return;

    this.selectedThemeName = themeName;

    for (const key in selected) {
      if (key !== "name") {
        this.formValues[key] = selected[key];
      }
    }
    this.onValueChange();
    this.changed = false;
  }

  saveSettings() {
    const updates: Promise<any>[] = [];

    // Text-based settings
    for (const key in this.formValues) {
      if (this.formValues[key] !== this.originalValues[key]) {
        updates.push(
          this.settingsService
            .saveSetting(key, String(this.formValues[key]))
            .toPromise()
        );
      }
    }

    for (const key in this.pendingFileUploads) {
      const file =
        this.pendingFileUploads[key as keyof typeof this.pendingFileUploads];
      if (file) {
        const formData = new FormData();
        formData.append("file", file, file.name);
        formData.append("key", key);
        updates.push(this.settingsService.uploadImage(formData).toPromise());
      }
    }

    Promise.all(updates)
      .then(() => {
        this.changed = false;
        this.statusService.show("Settings saved!", "success");
        this.settingsService.clearCache();

        setTimeout(() => {
          window.location.reload();
        }, 500);
      })
      .catch(() => {
        this.statusService.show("Failed to save settings.", "error");
      });
  }

  confirmDeleteTheme(themeName: string): void {
    if (!themeName) return;

    if (confirm(`Are you sure you want to delete the theme "${themeName}"?`)) {
      this.themesService.deleteTheme(themeName).subscribe({
        next: () => {
          this.themePresets = this.themePresets.filter(
            (t) => t.name !== themeName
          );

          if (this.themePresets.length > 0) {
            this.selectedThemeName = this.themePresets[0].name;
            this.applyTheme(this.selectedThemeName);
          } else {
            this.selectedThemeName = "Unsaved Theme";
          }

          this.statusService.show(`Deleted theme "${themeName}"`, "success");
        },
        error: () => {
          this.statusService.show(`Deleted theme "${themeName}"`, "success");
        },
      });
    }
  }

  opacityOptions = Array.from({ length: 11 }, (_, i) => {
    const value = (i * 0.1).toFixed(1);
    return {
      value: value,
      label: `${Math.round(+value * 100)}%`,
    };
  });

  fontWeightOptions = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  fontSizeOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  onValueChange() {
    const textChanged = Object.keys(this.formValues).some(
      (key) =>
        key !== "FAVICON_IMAGE" &&
        key !== "LOGO_IMAGE" &&
        String(this.formValues[key]) !== String(this.originalValues[key])
    );

    const imageChanged = Object.values(this.pendingFileUploads).some(Boolean);

    this.changed = textChanged || imageChanged;
  }

  onFileSelected(event: Event, key: "GLOBAL_BACKGROUND_IMAGE") {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("file", file);

      this.statusService.show("Uploading image...", "loading");

      this.themesService.uploadThemeImage(formData).subscribe({
        next: (res) => {
          this.statusService.show("Upload successful!", "success");

          this.formValues[key] = res.filename;

          this.previewUrls[key] = `assets/theme/background/${res.filename}`;
          this.backgroundImageLoadError = false;
          this.onValueChange();
        },
        error: () => {
          this.statusService.show("Upload failed.", "error");
        },
      });
    }
  }

  triggerFileInput() {
    this.fileInputLogo.nativeElement.click();
  }

  previewUrls: Record<
    "FAVICON_IMAGE" | "LOGO_IMAGE" | "GLOBAL_BACKGROUND_IMAGE",
    string | null
  > = {
    FAVICON_IMAGE: null,
    LOGO_IMAGE: null,
    GLOBAL_BACKGROUND_IMAGE: null,
  };

  pendingFileUploads: Record<
    "FAVICON_IMAGE" | "LOGO_IMAGE" | "GLOBAL_BACKGROUND_IMAGE",
    File | null
  > = {
    FAVICON_IMAGE: null,
    LOGO_IMAGE: null,
    GLOBAL_BACKGROUND_IMAGE: null,
  };

  get backgroundColor(): string {
    return String(this.formValues["GLOBAL_BACKGROUND_COLOR"] || "");
  }

  get searchFieldBackgroundColor(): string {
    return String(this.formValues["SEARCH_FEATURE_BACKGROUND_COLOR"] || "");
  }

  set backgroundColor(val: string) {
    this.formValues["GLOBAL_BACKGROUND_COLOR"] = val;
    this.onValueChange();
  }

  saveToCurrentTheme() {
    if (!this.selectedThemeName) {
      this.statusService.show("No theme selected to overwrite.", "error");
      return;
    }

    const allowedKeys = [
      "GLOBAL_BACKGROUND_TYPE",
      "GLOBAL_BACKGROUND_IMAGE",
      "GLOBAL_BACKGROUND_COLOR",
      "SEARCH_FEATURE_BACKGROUND_COLOR",
      "SEARCH_FEATURE_BACKGROUND_OPACITY",
      "CATEGORY_FONT_COLOR",
      "CATEGORY_FONT_WEIGHT",
      "CATEGORY_FONT_SIZE",
      "CATEGORY_BUTTON_BACKGROUND_COLOR",
      "CATEGORY_BUTTON_BACKGROUND_OPACITY",
      "SETTINGS_BUTTON_BACKGROUND_COLOR",
      "SETTINGS_BUTTON_BACKGROUND_OPACITY",
      "GROUP_BACKGROUND_COLOR",
      "GROUP_BACKGROUND_OPACITY",
      "GROUP_FONT_COLOR",
      "GROUP_FONT_WEIGHT",
      "GROUP_FONT_SIZE",
      "GROUP_BORDER_COLOR",
      "GROUP_BORDER_WIDTH",
      "GROUP_FOOTER_ICON_COLOR",
      "GROUP_FOOTER_BACKGROUND_COLOR",
      "GROUP_FOOTER_BACKGROUND_OPACITY",
      "LINK_BACKGROUND_COLOR",
      "LINK_BACKGROUND_OPACITY",
      "LINK_FONT_COLOR",
      "LINK_FONT_WEIGHT",
      "LINK_FONT_SIZE",
      "LIST_BACKGROUND_COLOR",
      "LIST_BACKGROUND_OPACITY",
      "LIST_FONT_COLOR",
      "LIST_FONT_WEIGHT",
      "LIST_FONT_SIZE",
      "LIST_BORDER_COLOR",
      "LIST_BORDER_WIDTH",
      "LINK_BORDER_COLOR",
      "LINK_BORDER_WIDTH",
      "LIST_BORDER_CORNER_RADIUS",
      "LINK_BORDER_CORNER_RADIUS",
      "GROUP_BORDER_CORNER_RADIUS",
      "SEARCH_FEATURE_CORNER_RADIUS",
      "SEARCH_FEATURE_BORDER_COLOR",
      "SEARCH_FEATURE_FONT_COLOR",
      "SEARCH_FEATURE_BORDER_WIDTH",
      "GROUP_ICON_COLOR",
      "LIST_ICON_COLOR",
      "LOGO_HEIGHT_PX",
      "LOGO_WIDTH_PX"
    ];

    const data = Object.fromEntries(
      Object.entries(this.formValues).filter(([key]) =>
        allowedKeys.includes(key)
      )
    );

    this.themesService.saveTheme(this.selectedThemeName, data).subscribe(() => {
      this.statusService.show(
        `Theme "${this.selectedThemeName}" updated successfully!`,
        "success"
      );
      this.themesService.loadThemes().subscribe((themes) => {
        this.themePresets = themes.map((t) => ({
          name: t.name,
          ...JSON.parse(t.data),
        }));
        this.changed = false;
      });
    });
  }

  async exportCurrentTheme() {
    this.statusService.show("Exporting theme...", "loading");
    const allowedKeys = [
      "GLOBAL_BACKGROUND_TYPE",
      "GLOBAL_BACKGROUND_IMAGE",
      "GLOBAL_BACKGROUND_COLOR",
      "SEARCH_FEATURE_BACKGROUND_COLOR",
      "SEARCH_FEATURE_BACKGROUND_OPACITY",
      "CATEGORY_FONT_COLOR",
      "CATEGORY_FONT_WEIGHT",
      "CATEGORY_FONT_SIZE",
      "CATEGORY_BUTTON_BACKGROUND_COLOR",
      "CATEGORY_BUTTON_BACKGROUND_OPACITY",
      "SETTINGS_BUTTON_BACKGROUND_COLOR",
      "SETTINGS_BUTTON_BACKGROUND_OPACITY",
      "GROUP_BACKGROUND_COLOR",
      "GROUP_BACKGROUND_OPACITY",
      "GROUP_FONT_COLOR",
      "GROUP_FONT_WEIGHT",
      "GROUP_FONT_SIZE",
      "GROUP_BORDER_COLOR",
      "GROUP_BORDER_WIDTH",
      "GROUP_FOOTER_ICON_COLOR",
      "GROUP_FOOTER_BACKGROUND_COLOR",
      "GROUP_FOOTER_BACKGROUND_OPACITY",
      "LINK_BACKGROUND_COLOR",
      "LINK_BACKGROUND_OPACITY",
      "LINK_FONT_COLOR",
      "LINK_FONT_WEIGHT",
      "LINK_FONT_SIZE",
      "LIST_BACKGROUND_COLOR",
      "LIST_BACKGROUND_OPACITY",
      "LIST_FONT_COLOR",
      "LIST_FONT_WEIGHT",
      "LIST_FONT_SIZE",
      "LIST_BORDER_COLOR",
      "LIST_BORDER_WIDTH",
      "LINK_BORDER_COLOR",
      "LINK_BORDER_WIDTH",
      "LIST_BORDER_CORNER_RADIUS",
      "LINK_BORDER_CORNER_RADIUS",
      "GROUP_BORDER_CORNER_RADIUS",
      "SEARCH_FEATURE_CORNER_RADIUS",
      "SEARCH_FEATURE_BORDER_COLOR",
      "SEARCH_FEATURE_FONT_COLOR",
      "SEARCH_FEATURE_BORDER_WIDTH",
      "GROUP_ICON_COLOR",
      "LIST_ICON_COLOR",
      "LOGO_HEIGHT_PX",
      "LOGO_WIDTH_PX"
    ];

    const themeOnly = Object.fromEntries(
      Object.entries(this.formValues).filter(([key]) =>
        allowedKeys.includes(key)
      )
    );

    const exportData = {
      name:
        this.selectedThemeName && this.selectedThemeName.trim() !== ""
          ? this.selectedThemeName
          : "Exported Theme",
      data: themeOnly,
    };

    const zip = new JSZip();

    zip.file("theme.json", JSON.stringify(exportData, null, 2));

    const filename = this.formValues["GLOBAL_BACKGROUND_IMAGE"];
    if (filename) {
      const path = `assets/theme/background/${filename}`;
      try {
        const response = await fetch(path);
        const blob = await response.blob();
        zip.file(filename, blob);
      } catch (err) {
        console.warn("Could not fetch image for ZIP:", path, err);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const safeName = exportData.name
      .replace(/[^a-z0-9_-]+/gi, "_")
      .toLowerCase();
    saveAs(content, `theme-${safeName}.zip`);
  }

  saveAsNewTheme() {
    const dialogRef = this.dialog.open(DialogNameThemeComponent, {
      width: "500px",
    });

    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (!result) return;

      const allowedKeys = [
        "GLOBAL_BACKGROUND_TYPE",
        "GLOBAL_BACKGROUND_IMAGE",
        "GLOBAL_BACKGROUND_COLOR",
        "SEARCH_FEATURE_BACKGROUND_COLOR",
        "SEARCH_FEATURE_BACKGROUND_OPACITY",
        "CATEGORY_FONT_COLOR",
        "CATEGORY_FONT_WEIGHT",
        "CATEGORY_FONT_SIZE",
        "CATEGORY_BUTTON_BACKGROUND_COLOR",
        "CATEGORY_BUTTON_BACKGROUND_OPACITY",
        "SETTINGS_BUTTON_BACKGROUND_COLOR",
        "SETTINGS_BUTTON_BACKGROUND_OPACITY",
        "GROUP_BACKGROUND_COLOR",
        "GROUP_BACKGROUND_OPACITY",
        "GROUP_FONT_COLOR",
        "GROUP_FONT_WEIGHT",
        "GROUP_FONT_SIZE",
        "GROUP_BORDER_COLOR",
        "GROUP_BORDER_WIDTH",
        "GROUP_FOOTER_ICON_COLOR",
        "GROUP_FOOTER_BACKGROUND_COLOR",
        "GROUP_FOOTER_BACKGROUND_OPACITY",
        "LINK_BACKGROUND_COLOR",
        "LINK_BACKGROUND_OPACITY",
        "LINK_FONT_COLOR",
        "LINK_FONT_WEIGHT",
        "LINK_FONT_SIZE",
        "LIST_BACKGROUND_COLOR",
        "LIST_BACKGROUND_OPACITY",
        "LIST_FONT_COLOR",
        "LIST_FONT_WEIGHT",
        "LIST_FONT_SIZE",
        "LIST_BORDER_COLOR",
        "LIST_BORDER_WIDTH",
        "LINK_BORDER_COLOR",
        "LINK_BORDER_WIDTH",
        "LIST_BORDER_CORNER_RADIUS",
        "LINK_BORDER_CORNER_RADIUS",
        "GROUP_BORDER_CORNER_RADIUS",
        "SEARCH_FEATURE_CORNER_RADIUS",
        "SEARCH_FEATURE_BORDER_COLOR",
        "SEARCH_FEATURE_FONT_COLOR",
        "SEARCH_FEATURE_BORDER_WIDTH",
        "GROUP_ICON_COLOR",
        "LIST_ICON_COLOR",
        "LOGO_HEIGHT_PX",
        "LOGO_WIDTH_PX"
      ];

      const data = Object.fromEntries(
        Object.entries(this.formValues).filter(([key]) =>
          allowedKeys.includes(key)
        )
      );

      this.themesService.saveTheme(result, data).subscribe(() => {
        this.statusService.show("Theme saved successfully!", "success");
        this.selectedThemeName = result;
        this.themesService.loadThemes().subscribe((themes) => {
          this.themePresets = themes.map((t) => ({
            name: t.name,
            ...JSON.parse(t.data),
          }));
        });
      });
    });
  }

  get backgroundImageUrl(): string | null {
    const filename = this.formValues["GLOBAL_BACKGROUND_IMAGE"];
    return filename ? `assets/theme/background/${filename}` : null;
  }
}
