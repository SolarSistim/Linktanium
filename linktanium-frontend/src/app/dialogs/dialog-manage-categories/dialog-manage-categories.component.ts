import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDialogContent, MatDialogActions } from "@angular/material/dialog";
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { DashboardDropService } from "../../features/dashboard-drop/dashboard-drop.service";

@Component({
  selector: "app-dialog-manage-categories",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogContent,
    MatDialogActions,
    DragDropModule,
  ],
  templateUrl: "./dialog-manage-categories.component.html",
  styleUrls: ["./dialog-manage-categories.component.css"],
})
export class DialogManageCategoriesComponent implements OnInit {
  
  @ViewChild("categoryInput") categoryInputRef!: ElementRef;
  editableCategories: { id: number; name: string; isEditing?: boolean }[] = [];
  newCategoryName = "";
  originalOrder: number[] = [];
  showAddForm = false;

  private dropService = inject(DashboardDropService);
  @Output() categoriesUpdated = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<DialogManageCategoriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data?.categories) {
      const passedCategories = this.data.categories;
      this.editableCategories = passedCategories.map((cat: any) => ({
        ...cat,
      }));
      this.originalOrder = this.editableCategories.map((cat) => cat.id);
    } else {
      this.dropService.fetchCategories().subscribe({
        next: (categories) => {
          this.editableCategories = categories.map((cat: any) => ({ ...cat }));
          this.originalOrder = this.editableCategories.map((cat) => cat.id);
        },
        error: (err) => {
          console.error("Failed to load categories", err);
          alert("Failed to load categories.");
        },
      });
    }
  }

  get isUnchanged(): boolean {
    const currentOrder = this.editableCategories.map((cat) => cat.id);
    return (
      currentOrder.length === this.originalOrder.length &&
      currentOrder.every((id, index) => id === this.originalOrder[index])
    );
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.editableCategories,
      event.previousIndex,
      event.currentIndex
    );
  }

  saveChanges() {
    const reordered = this.editableCategories.map((cat, index) => ({
      id: cat.id,
      position: index,
    }));

    this.dropService.reorderCategories(reordered).subscribe({
      next: () => {
        this.originalOrder = this.editableCategories.map((cat) => cat.id);
        this.categoriesUpdated.emit();
      },
      error: (err) => alert("Failed to save reorder: " + err.message),
    });
  }

  saveAndClose() {
    this.saveChanges();
    this.dialogRef.close(true);
  }

  enableEdit(cat: any) {
    cat.originalName = cat.name;
    cat.isEditing = true;
  }

  cancelEdit(cat: any) {
    cat.name = cat.originalName;
    cat.isEditing = false;
    delete cat.originalName;
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  saveEdit(cat: any) {
    this.dropService.updateCategory(cat.id, { name: cat.name }).subscribe({
      next: () => {
        cat.isEditing = false;
        this.categoriesUpdated.emit();
      },
      error: (err) => {
        console.error("Failed to update category", err);
        alert("Failed to save changes.");
      },
    });
  }

  deleteCategory(cat: any) {
    if (confirm(`Are you sure you want to delete "${cat.name}"?`)) {
      this.dropService.deleteCategory(cat.id).subscribe({
        next: () => {
          this.editableCategories = this.editableCategories.filter(
            (c) => c.id !== cat.id
          );
          this.originalOrder = this.editableCategories.map((cat) => cat.id);
          this.categoriesUpdated.emit();
        },
        error: (err) => {
          console.error("Failed to delete category", err);
          alert("Failed to delete category.");
        },
      });
    }
  }

  addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.dropService.createCategory({ name }).subscribe({
      next: (created: any) => {
        this.editableCategories.push(created);
        this.originalOrder = this.editableCategories.map((cat) => cat.id);
        this.newCategoryName = "";

        setTimeout(() => {
          if (this.categoryInputRef?.nativeElement) {
            this.categoryInputRef.nativeElement.focus();
          }
        });

      },
      error: (err) => {
        console.error("Failed to create category", err);
        alert("Failed to create category.");
      },
    });
  }
}
