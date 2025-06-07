import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  Inject,
} from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormsModule } from "@angular/forms";
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import {
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
} from "@angular/material/dialog";
import { DashboardDropService } from "../../features/dashboard-drop/dashboard-drop.service";
import { MatFormFieldModule } from "@angular/material/form-field";

interface EditableGroup {
  id: number;
  name: string;
  position: number;
  isEditing?: boolean;
}

@Component({
  selector: "app-dialog-manage-link-groups",
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    DragDropModule,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: "./dialog-manage-link-groups.component.html",
  styleUrls: ["./dialog-manage-link-groups.component.css"],
})
export class DialogManageLinkGroupsComponent implements OnInit {

  @ViewChild("groupInput") groupInputRef!: ElementRef;
  private dropService = inject(DashboardDropService);
  private dialogRef = inject(MatDialogRef<DialogManageLinkGroupsComponent>);
  newGroupName = "";
  showAddLinkGroup = false;
  newLinkGroupName = "";
  categories: any[] = [];
  originalOrder: number[] = [];
  selectedCategoryId: number | null = null;
  editableGroups: EditableGroup[] = [];

    constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { categoryId?: number; groupId?: number }
  ) {}

  ngOnInit() {
    this.dropService.getFullDashboard().subscribe((categories) => {
      this.categories = categories;

      const initialCategoryId = this.data?.categoryId ?? categories[0]?.id;
      if (initialCategoryId) {
        this.selectCategory(initialCategoryId);
      }
    });
  }

  selectCategory(id: number) {
    this.selectedCategoryId = id;
    const selected = this.categories.find((cat) => cat.id === id);
    this.editableGroups = selected?.groups.map((g: any) => ({ ...g })) || [];
    this.originalOrder = this.editableGroups.map((g) => g.id);
  }

  get hasOrderChanged(): boolean {
    if (this.originalOrder.length !== this.editableGroups.length) {
      return true;
    }

    return !this.originalOrder.every(
      (id, index) => id === this.editableGroups[index]?.id
    );
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.editableGroups,
      event.previousIndex,
      event.currentIndex
    );
  }

  enableEdit(group: any) {
    group.originalName = group.name;
    group.isEditing = true;
  }

  cancelEdit(group: any) {
    group.name = group.originalName;
    group.isEditing = false;
    delete group.originalName;
  }

  onCategoryChange(event: any) {
    const selectedId = event.value;
    this.selectCategory(selectedId);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveEdit(group: any) {
    this.dropService.updateGroup(group.id, { name: group.name }).subscribe({
      next: () => {
        group.isEditing = false;
      },
      error: (err) => {
        console.error("Failed to update group", err);
        alert("Failed to save changes.");
      },
    });
  }

  deleteGroup(group: any) {
    if (confirm(`Are you sure you want to delete "${group.name}"?`)) {
      this.dropService.deleteGroup(group.id).subscribe({
        next: () => {
          this.editableGroups = this.editableGroups.filter(
            (g) => g.id !== group.id
          );
          this.originalOrder = this.editableGroups.map((g) => g.id);
        },
        error: (err: any) => {
          console.error("Failed to delete group", err);
          alert("Failed to delete group.");
        },
      });
    }
  }

  addGroup() {
    const name = this.newGroupName.trim();
    if (!name || !this.selectedCategoryId) return;

    const position = this.editableGroups.length;

    this.dropService
      .createLinkGroup({
        name,
        categoryId: this.selectedCategoryId,
        position,
      })
      .subscribe({
        next: (created: any) => {
          this.editableGroups.push(created);
          this.editableGroups.sort((a, b) => a.position - b.position);
          this.originalOrder = this.editableGroups.map((g) => g.id);
          this.newGroupName = "";

          setTimeout(() => {
            this.groupInputRef.nativeElement.focus();
          });
        },
        error: (err) => {
          console.error("Failed to create group", err);
          alert("Failed to create group.");
        },
      });
  }

  saveOrder() {
    const reordered = this.editableGroups.map((group, index) => ({
      id: group.id,
      position: index,
    }));

    if (!this.selectedCategoryId) return;

    this.dropService
      .reorderGroups(this.selectedCategoryId, reordered)
      .subscribe({
        next: () => {
          this.originalOrder = this.editableGroups.map((g) => g.id);
        },
        error: (err) => {
          console.error("Failed to save reorder", err);
          alert("Failed to save reorder.");
        },
      });
  }

  get isUnchanged(): boolean {
    const currentOrder = this.editableGroups.map((group) => group.id);
    return (
      currentOrder.length === this.originalOrder.length &&
      currentOrder.every((id, index) => id === this.originalOrder[index])
    );
  }

  saveChanges() {
    if (!this.selectedCategoryId) return;

    const reordered = this.editableGroups.map((group, index) => ({
      id: group.id,
      position: index,
    }));

    this.dropService
      .reorderGroups(this.selectedCategoryId, reordered)
      .subscribe({
        next: () => {
          this.originalOrder = this.editableGroups.map((g) => g.id);
        },
        error: (err) => {
          console.error("Failed to save group reorder", err);
          alert("Failed to save group reorder.");
        },
      });
  }

  saveAndClose() {
    this.saveChanges();
    this.dialogRef.close(true);
  }
}
