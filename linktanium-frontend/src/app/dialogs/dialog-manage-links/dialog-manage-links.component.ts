import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  Inject,
  Optional,
  EventEmitter,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { DashboardDropService } from "../../features/dashboard-drop/dashboard-drop.service";

@Component({
  selector: "app-dialog-manage-links",
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
  templateUrl: "./dialog-manage-links.component.html",
  styleUrl: "./dialog-manage-links.component.css",
})
export class DialogManageLinksComponent implements OnInit {
  
  @ViewChild("linkNameInput") linkNameInputRef!: ElementRef;
  @Output() linkAdded = new EventEmitter<void>();
  @Output() groupNameUpdated = new EventEmitter<void>();
  private dropService = inject(DashboardDropService);
  private dialogRef = inject(MatDialogRef<DialogManageLinksComponent>);
  categories: any[] = [];
  filteredGroups: any[] = [];
  editableLinks: any[] = [];
  originalOrder: number[] = [];
  showAddForm = false;
  selectedCategoryId: number | null = null;
  selectedGroupId: number | null = null;
  newLinkDescription = "";
  newLinkName = "";
  newLinkUrl = "";
  groupName = "";
  originalGroupName = "";
  showGroupEditor = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    @Optional()
    public data: {
      categoryId?: number;
      groupId?: number;
      showGroupEditor?: boolean;
    }
  ) {
    this.showGroupEditor = data?.showGroupEditor ?? false;
  }

  ngOnInit() {
    this.dropService.fetchCategories().subscribe((categories) => {
      this.categories = categories;

      if (categories.length > 0) {
        this.selectedCategoryId = this.data?.categoryId ?? categories[0].id;
        this.onCategoryChange(() => {
          this.selectedGroupId =
            this.data?.groupId ?? this.filteredGroups[0]?.id ?? null;
          this.onGroupChange();
        });
      }
    });
  }

  onCategoryChange(callback?: () => void) {
    const selectedCat = this.categories.find(
      (c) => +c.id === +this.selectedCategoryId!
    );
    this.filteredGroups = selectedCat?.groups || [];
    this.editableLinks = [];

    if (this.filteredGroups.length > 0) {
      this.selectedGroupId = this.filteredGroups[0].id;
      this.onGroupChange();
    }

    callback?.();
  }

  addLink() {
    const name = this.newLinkName.trim();
    const url = this.newLinkUrl.trim();
    const description = this.newLinkDescription.trim();

    if (!name || !url || !this.selectedGroupId) return;

    const payload = {
      name,
      url,
      icon: "default.png",
      description,
      groupId: this.selectedGroupId,
    };

    this.dropService.createLink(payload).subscribe({
      next: (created: any) => {
        this.editableLinks.push(created);
        this.editableLinks.sort((a, b) => a.position - b.position);
        this.originalOrder = this.editableLinks.map((link) => link.id);

        this.newLinkName = "";
        this.newLinkUrl = "";
        this.newLinkDescription = "";
        this.linkAdded.emit();

        setTimeout(() => {
          this.linkNameInputRef.nativeElement.focus();
        });
      },
      error: (err) => {
        console.error("Failed to create link", err);
        alert("Failed to create link.");
      },
    });
  }

  cancelAddLink() {
    this.newLinkName = "";
    this.newLinkUrl = "";
    this.newLinkDescription = "";
    this.showAddForm = false;
  }

  onGroupChange() {
    this.dropService.getAllLinks().subscribe((links) => {
      this.editableLinks = links
        .filter((link) => link.group?.id === this.selectedGroupId)
        .map((link) => ({ ...link, isEditing: false }));
      this.originalOrder = this.editableLinks.map((link) => link.id);
    });

    const selectedGroup = this.filteredGroups.find(
      (g) => g.id === this.selectedGroupId
    );
    if (selectedGroup) {
      this.groupName = selectedGroup.name;
      this.originalGroupName = selectedGroup.name;
    }
  }

  saveGroupName() {
    if (
      !this.selectedGroupId ||
      this.groupName.trim() === this.originalGroupName
    )
      return;

    this.dropService
      .updateGroup(this.selectedGroupId, { name: this.groupName.trim() })
      .subscribe({
        next: () => {
          const group = this.filteredGroups.find(
            (g) => g.id === this.selectedGroupId
          );
          if (group) group.name = this.groupName.trim();

          const cat = this.categories.find(
            (c) => c.id === this.selectedCategoryId
          );
          const fullGroup = cat?.groups.find(
            (g: { id: number | null }) => g.id === this.selectedGroupId
          );
          if (fullGroup) fullGroup.name = this.groupName.trim();

          this.originalGroupName = this.groupName.trim();
          this.groupNameUpdated.emit();
        },
        error: (err) => {
          console.error("Failed to update group name", err);
          alert("Failed to update group name.");
        },
      });
  }

  get isUnchanged(): boolean {
    const groupNameSame =
      this.groupName.trim() === this.originalGroupName.trim();
    const orderSame = this.originalOrder.every(
      (id, idx) => id === this.editableLinks[idx]?.id
    );
    return groupNameSame && orderSame;
  }

  saveChanges() {
    const updates: Promise<any>[] = [];

    if (this.groupName.trim() !== this.originalGroupName.trim()) {
      updates.push(
        this.dropService
          .updateGroup(this.selectedGroupId!, { name: this.groupName.trim() })
          .toPromise()
      );
    }

    if (
      !this.originalOrder.every((id, idx) => id === this.editableLinks[idx]?.id)
    ) {
      const reordered = this.editableLinks.map((link, idx) => ({
        id: link.id,
        position: idx,
      }));
      updates.push(this.dropService.reorderLinks(reordered).toPromise());
    }

    Promise.all(updates)
      .then(() => {
        this.originalGroupName = this.groupName.trim();
        this.originalOrder = this.editableLinks.map((l) => l.id);
      })
      .catch((err) => {
        console.error("Failed to save changes", err);
        alert("Failed to save changes.");
      });
  }

  saveAndClose() {
    this.saveChanges();
    this.dialogRef.close(true);
  }

  get hasOrderChanged(): boolean {
    return !this.originalOrder.every(
      (id, idx) => id === this.editableLinks[idx]?.id
    );
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.editableLinks,
      event.previousIndex,
      event.currentIndex
    );
  }

  saveOrder() {
    const reordered = this.editableLinks.map((link, idx) => ({
      id: link.id,
      position: idx,
    }));

    this.dropService.reorderLinks(reordered).subscribe({
      next: () => {
        this.originalOrder = this.editableLinks.map((l) => l.id);
      },
      error: (err) => {
        console.error("Failed to save reorder", err);
        alert("Failed to save link order.");
      },
    });
  }

  deleteLink(link: any) {
    if (confirm(`Delete link "${link.name}"?`)) {
      this.dropService.deleteLink(link.id).subscribe({
        next: () => {
          this.editableLinks = this.editableLinks.filter(
            (l) => l.id !== link.id
          );
          this.originalOrder = this.editableLinks.map((l) => l.id);
        },
        error: (err) => {
          console.error("Failed to delete link", err);
          alert("Failed to delete link.");
        },
      });
    }
  }

  enableEdit(link: any) {
    link.originalName = link.name;
    link.originalUrl = link.url;
    link.originalDescription = link.description;
    link.isEditing = true;
  }

  cancelEdit(link: any) {
    link.name = link.originalName;
    link.url = link.originalUrl;
    link.description = link.originalDescription;
    link.isEditing = false;
  }

  saveEdit(link: any) {
    const updatePayload = {
      name: link.name,
      url: link.url,
      description: link.description,
    };

    this.dropService.updateLink(link.id, updatePayload).subscribe({
      next: () => {
        link.isEditing = false;
      },
      error: (err: any) => {
        console.error("Failed to update link", err);
        alert("Failed to save changes.");
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
