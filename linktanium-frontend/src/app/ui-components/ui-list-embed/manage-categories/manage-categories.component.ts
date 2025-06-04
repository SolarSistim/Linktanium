import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  CdkDropList,
  CdkDrag,
  DragDropModule,
  CdkDragDrop,
} from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ListsService } from "../../../features/lists/lists.service";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";

interface Category {
  id: number;
  name: string;
  position?: number;
  isEditing?: boolean;
  tempName?: string;
}

interface TestItem {
  id: number;
  name: string;
  position: number;
  categoryName: string;
  pinned: boolean;
  createdAt?: string;
  priority?: "High" | "Medium" | "Low";
  description?: string;
  isEditing?: boolean;
  tempName?: string;
  tempPriority?: "High" | "Medium" | "Low";
  tempCategoryName?: string;
  tempDescription?: string;
  showDetails?: boolean;
  highlight?: boolean;
  highlightClass?: "highlightA" | "highlightB";
  showPriorityPanel?: boolean;
  categoryId?: number | null;
  confirmingComplete?: boolean;
}

@Component({
  selector: "app-manage-categories",
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    DragDropModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: "./manage-categories.component.html",
  styleUrls: ["./manage-categories.component.css"],
})
export class ManageCategoriesComponent {
  @Output() categoryDeleted = new EventEmitter<void>();
  @Output() categoryAdded = new EventEmitter<void>();
  @Output() categoryAddCompleted = new EventEmitter<void>();
  @Input() listId: number | null = null;
  @Output() exit = new EventEmitter<void>();
  @Output() newCategoryNameChange = new EventEmitter<string>();
  @Output() categoriesChanged = new EventEmitter<Category[]>();
  @Input() set externalNewCategoryName(val: string) {
    this.newCategoryName = val;
    this.newCategoryNameChange.emit(this.newCategoryName);
  }
  @Output() anyEditingChange = new EventEmitter<boolean>();
  @Output() returnClicked = new EventEmitter<void>();
  @Input() testItems: TestItem[] = [];
  @Input() styleSettings: {
    groupBackgroundColor?: string;
    groupFontColor?: string;
    linkBackgroundColor?: string;
    linkFontColor?: string;
  } = {};

  categories: Category[] = [];
  newCategoryName = "";
  isLoading = false;
  isHovering = false;
  hoveredButtonKey: string | null = null;

  constructor(private listsService: ListsService) {}

  ngOnInit(): void {
    console.log(
      "📋 Categories loaded:",
      this.categories.map((c) => c.id)
    );
    this.loadCategories();
  }

  ngDoCheck() {
    this.anyEditingChange.emit(this.anyCategoryEditing);
  }

  refreshCategories() {
    this.loadCategories();
  }

  cancelEditMode() {
    this.newCategoryName = "";
    this.exit.emit();
  }

  get anyCategoryEditing(): boolean {
    return this.categories.some((cat) => cat.isEditing);
  }

  getItemCountForCategory(categoryId: number): number {
    const category = this.categories.find((cat) => cat.id === categoryId);
    if (!category) {
      return 0;
    }
    const categoryName = category.name;

    const count = this.testItems.filter(
      (item) => !item.pinned && item.categoryName === categoryName
    ).length;
    return count;
  }

  addCategory(keepFormOpen = false) {
    const name = this.newCategoryName.trim();
    const listId = this.listId;
    if (!name || !listId) return;

    this.listsService.addCategoryForList(listId, name).subscribe({
      next: () => {
        this.newCategoryName = "";

        this.listsService.getCategoriesForList(listId).subscribe({
          next: (categories) => {
            this.categories = categories.sort(
              (a, b) => a.position - b.position
            );
            this.categoriesChanged.emit(this.categories);
            this.categoryAdded.emit();
            if (!keepFormOpen) {
              this.categoryAddCompleted.emit();
            }
          },
          error: (err) => {
            console.error("❌ Failed to fetch categories after add:", err);
          },
        });
      },
      error: (err) => {
        console.error("❌ Failed to add category:", err);
        alert(err?.error?.message || "Failed to add category");
      },
    });
  }

  loadCategories() {
    if (!this.listId) return;
    this.isLoading = true;
    this.listsService.getCategoriesForList(this.listId).subscribe({
      next: (categories) => {
        this.categories = categories.sort((a, b) => a.position - b.position);
        this.categoriesChanged.emit(this.categories);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("❌ Failed to load categories:", err);
        this.isLoading = false;
      },
    });
  }

  editCategory(cat: Category) {
    cat.isEditing = true;
    cat.tempName = cat.name;
  }

  cancelCategoryEdit(cat: Category) {
    cat.isEditing = false;
    cat.tempName = "";
  }

  saveCategoryEdit(cat: Category) {
    const trimmedName = (cat.tempName || "").trim();
    if (!trimmedName || !this.listId) {
      alert("Category name cannot be empty.");
      return;
    }

    this.listsService
      .updateCategoryName(this.listId, cat.id, trimmedName)
      .subscribe({
        next: () => {
          cat.name = trimmedName;
          cat.isEditing = false;
          cat.tempName = "";
          this.loadCategories();
        },
        error: (err) => {
          console.error("❌ Failed to update category name:", err);
          alert(err?.error?.message || "Failed to update category");
        },
      });
  }

  deleteCategory(cat: Category) {
    if (!this.listId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete category "${cat.name}"?`
    );
    if (!confirmed) return;

    this.listsService.deleteCategoryForList(this.listId, cat.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== cat.id);
        console.log(`✅ Deleted category with ID ${cat.id}`);
        this.categoryDeleted.emit();
        this.categoriesChanged.emit(this.categories);
      },
      error: (err) => {
        console.error("❌ Failed to delete category:", err);
        alert(err?.error?.message || "Failed to delete category");
      },
    });
  }

  onDrop(event: CdkDragDrop<Category[]>) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);

    const payload = this.categories.map((cat, index) => ({
      id: cat.id,
      position: index,
    }));

    this.listsService
      .reorderCategoriesForList(this.listId!, payload)
      .subscribe({
        next: () => console.log("✅ Categories reordered"),
        error: (err) => console.error("❌ Failed to reorder categories", err),
      });
  }
}
