import {
  Component,
  OnInit,
  AfterViewChecked,
  ElementRef,
  ViewChildren,
  QueryList,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatTabsModule, MatTabGroup } from "@angular/material/tabs";
import { DashboardDropService } from "./dashboard-drop.service";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialog } from "@angular/material/dialog";
import { DialogConfirmComponent } from "../../dialogs/dialog-confirm/dialog-confirm.component";
import { DialogAddCategoryComponent } from "../../dialogs/dialog-add-category/dialog-add-category.component";
import { DialogEditSingleCategoryComponent } from "../../dialogs/dialog-edit-single-category/dialog-edit-single-category.component";
import { DialogManageCategoriesComponent } from "../../dialogs/dialog-manage-categories/dialog-manage-categories.component";
import { UiLinkGroupComponent } from "../../ui-components/ui-link-group/ui-link-group.component";
import { MatButtonModule } from "@angular/material/button";
import { SettingsService } from "../../settings-components/app-settings/settings.service";
import { TutorialsService } from "../../settings-components/tutorials/tutorials.service";
// tutorials
import { TutorialCrashCourseComponent } from "../../settings-components/tutorials/tutorial-components/tutorial-crash-course/tutorial-crash-course.component";

@Component({
  selector: "app-dashboard-drop",
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatMenuModule,
    UiLinkGroupComponent,
    MatButtonModule,
    TutorialCrashCourseComponent,
  ],
  templateUrl: "./dashboard-drop.component.html",
  styleUrls: ["./dashboard-drop.component.css"],
})
export class DashboardDropComponent implements OnInit, AfterViewChecked {

  categories: any[] = [];
  isGroupDraggable: boolean = true;
  isLinkDraggable: boolean = true;
  selectedTabIndex: number = 0;
  dashboardColumns = 6;
  categoryFontColor = "#ffffff";
  categoryFontWeight = "400";
  categoryFontSize = "18px";
  selectedThemeName: string = "";
  showDashboardTutorial = true;
  dashboardTutorialId: number | null = null;
  @ViewChildren("groupNameContainer")
  groupNameContainers!: QueryList<ElementRef>;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  constructor(
    private dropService: DashboardDropService,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private tutorialsService: TutorialsService
  ) {}

  ngOnInit(): void {
    this.loadDashboardTutorial();
    this.settingsService.loadSettings().subscribe((settings) => {
      this.dashboardColumns = parseInt(
        settings["DASHBOARD_COLUMNS"] || "6",
        10
      );
      document.documentElement.style.setProperty(
        "--dashboard-columns",
        this.dashboardColumns.toString()
      );

      this.categoryFontColor = settings["CATEGORY_FONT_COLOR"] || "#ffffff";
      this.categoryFontWeight = settings["CATEGORY_FONT_WEIGHT"] || "900";
      this.categoryFontSize = settings["CATEGORY_FONT_SIZE"]
        ? `${settings["CATEGORY_FONT_SIZE"]}px`
        : "18px";
    });

    this.setCategoryTabStyles();

    this.dropService.fetchSimpleCategories().subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.categories = [
            {
              id: -1,
              name: "Linktanium",
              groups: [],
              loaded: true,
              isPlaceholder: true,
            },
          ];
        } else {
          this.categories = data.map((c) => ({
            ...c,
            groups: [],
            loaded: false,
          }));

          if (this.categories.length > 0) {
            this.loadCategoryGroups(this.categories[0]);
          }
        }
      },
      error: (err) => console.error("Error loading categories", err),
    });
  }

  loadDashboardTutorial(): void {
    this.tutorialsService.getByFeature("dashboard_crash_course").subscribe({
      next: (tutorial: any) => {
        this.showDashboardTutorial = tutorial.display;
        this.dashboardTutorialId = tutorial.id;
      },
      error: (err: any) => {
        console.warn("Failed to load dashboard tutorial setting:", err);
      },
    });
  }

  dismissDashboardTutorial(): void {
    if (this.dashboardTutorialId !== null) {
      this.tutorialsService
        .updateDisplay(this.dashboardTutorialId, false)
        .subscribe({
          next: () => {
            this.showDashboardTutorial = false;
          },
          error: (err: any) => {
            console.error("Failed to update dashboard tutorial display:", err);
          },
        });
    }
  }

  ngAfterViewChecked(): void {
    this.groupNameContainers.forEach((containerRef, index) => {
      const container = containerRef.nativeElement;
      const groupNameElement = container.querySelector(".group-name");
      if (groupNameElement) {
        this.truncateGroupName(groupNameElement, container.offsetWidth);
      }
    });
  }

  setCategoryTabStyles(): void {
    this.settingsService.loadSettings().subscribe((settings) => {
      const hex = settings["CATEGORY_BUTTON_BACKGROUND_COLOR"] || "#2e3a46";
      const opacity = parseFloat(
        settings["CATEGORY_BUTTON_BACKGROUND_OPACITY"] || "1.0"
      );
      const rgba = this.hexToRgba(hex, opacity);
      document.body.style.setProperty("--category-tab-bg-rgba", rgba);
    });
  }

  hexToRgba(hex: string, opacity: number): string {
    let r = 0,
      g = 0,
      b = 0;

    hex = hex.replace("#", "");

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  loadCategoryGroups(category: any): void {
    if (category && !category.loaded) {
      this.dropService.fetchFullCategory(category.id).subscribe({
        next: (fullData) => {
          category.groups = fullData.groups || [];
          category.loaded = true;
        },
        error: (err) => console.error("Error loading full category", err),
      });
    }
  }

  onTabChange(event: any): void {
    const index = event.index;
    const category = this.categories[index];
    this.loadCategoryGroups(category);
  }

  truncateGroupName(element: HTMLElement, availableWidth: number): void {
    const originalText = element.textContent ? element.textContent.trim() : "";
    const computedStyle = window.getComputedStyle(element);
    const currentWidth = element.offsetWidth;

    if (currentWidth > availableWidth) {
      let truncatedText = originalText;
      while (element.offsetWidth > availableWidth && truncatedText.length > 0) {
        truncatedText = truncatedText.slice(0, -1);
        element.textContent = truncatedText + "...";
      }
      if (
        element.offsetWidth <= availableWidth &&
        truncatedText !== originalText
      ) {
        element.textContent = truncatedText + "...";
      } else if (truncatedText.length === 0 && originalText.length > 0) {
        element.textContent = "...";
      }
    } else {
      element.textContent = originalText;
    }
  }

  getSortedLinks(group: any): any[] {
    return [...group.links].sort((a, b) => a.position - b.position);
  }

  allowGroupDrag(): void {
    this.isGroupDraggable = false;
  }

  preventGroupDrag(): void {
    this.isGroupDraggable = true;
  }

  allowLinkDrag(): void {
    this.isLinkDraggable = false;
  }

  preventLinkDrag(): void {
    this.isLinkDraggable = true;
  }

  getConnectedDropLists(category: any): string[] {
    return category.groups.map((group: any) => `group-list-${group.id}`);
  }

  refreshCategories(): void {
    this.dropService.fetchCategories().subscribe({
      next: (data: any[]) => {
        if (data.length === 0) {
          this.categories = [
            {
              id: -1,
              name: "Linktanium",
              groups: [],
              loaded: true,
              isPlaceholder: true,
            },
          ];
          this.selectedTabIndex = 0;
        } else {
          this.categories = data.map((c) => ({
            ...c,
            groups: [],
            loaded: false,
          }));

          if (this.categories.length > 0) {
            this.selectedTabIndex = 0;
            this.loadCategoryGroups(this.categories[0]);
          }
        }
      },
      error: (err: any) => console.error("Error loading categories", err),
    });
  }

  refreshDashboard(): void {
    this.dropService.fetchCategories().subscribe({
      next: (data: any[]) => {
        if (data.length === 0) {
          this.categories = [
            {
              id: -1,
              name: "Linktanium",
              groups: [],
              loaded: true,
              isPlaceholder: true,
            },
          ];
        } else {
          this.categories = data.map((c) => ({
            ...c,
            groups: [],
            loaded: false,
          }));

          if (this.categories.length > 0) {
            this.loadCategoryGroups(this.categories[0]);
          }
        }
      },
      error: (err: any) => console.error("Error loading categories", err),
    });
  }

  openEditCategoryDialog(category: any): void {
    const dialogRef = this.dialog.open(DialogEditSingleCategoryComponent, {
      width: "500px",
      data: { categoryId: category.id },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshCategories();
    });
  }

  openManageCategoriesDialog(): void {
    const dialogRef = this.dialog.open(DialogManageCategoriesComponent, {
      width: "600px",
      data: {
        categories: this.categories,
      },
    });

    const instance = dialogRef.componentInstance;
    instance.categoriesUpdated.subscribe(() => {
      this.refreshCategories();
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshCategories();
    });
  }

  deleteCategory(category: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: "Delete Category",
        message: `Are you sure you want to delete the category "${category.name}"? This will also delete all groups and links in this category.`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dropService.deleteCategory(category.id).subscribe({
          next: () => {
            this.refreshCategories();
          },
          error: (err) => console.error("Failed to delete category", err),
        });
      }
    });
  }

  openAddCategoryDialog(): void {
    const dialogRef = this.dialog.open(DialogAddCategoryComponent, {
      width: "500px",
    });

    dialogRef.componentInstance.categoryAdded.subscribe(() => {
      this.refreshCategories();
    });
  }

  getGridColumns(): string {
    return `repeat(${this.dashboardColumns}, 1fr)`;
  }
}
