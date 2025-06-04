import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable, forkJoin } from "rxjs";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatMenuModule } from "@angular/material/menu";
import { DashboardDropService } from "../../features/dashboard-drop/dashboard-drop.service";
import { DialogAddLinkComponent } from "../../dialogs/dialog-add-link/dialog-add-link.component";
import { MatDialog } from "@angular/material/dialog";
import { DialogManageLinksComponent } from "../../dialogs/dialog-manage-links/dialog-manage-links.component";
import { DialogConfirmComponent } from "../../dialogs/dialog-confirm/dialog-confirm.component";
import { DialogManageLinkGroupsComponent } from "../../dialogs/dialog-manage-link-groups/dialog-manage-link-groups.component";
import { DialogAddGroupComponent } from "../../dialogs/dialog-add-group/dialog-add-group.component";
import { UiLinkComponent } from "../ui-link/ui-link.component";
import { StatusMessageService } from "../ui-status/ui-status.service";
import { SettingsService } from "../../settings-components/app-settings/settings.service";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import { UiListComponent } from "../ui-list/ui-list.component";
import { DialogAddListComponent } from "../../dialogs/dialog-add-list/dialog-add-list.component";
import { DialogListComponent } from "../../dialogs/dialog-list/dialog-list.component";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-ui-link-group",
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatMenuModule,
    UiLinkComponent,
    UiListComponent,
    MatButtonModule
  ],
  templateUrl: "./ui-link-group.component.html",
  styleUrls: ["./ui-link-group.component.css"],
})
export class UiLinkGroupComponent {
  @Input() category: any;
  @Input() categories: any[] = [];
  @Input() isGroupDraggable = true;
  @Input() isLinkDraggable = true;
  @Input() link: any;
  @Input() group!: any;
  @Input() selectedThemeName: string = "";
  @Output() groupMoved = new EventEmitter<void>();
  @Output() refreshRequested = new EventEmitter<void>();
  @Output() refreshCategories = new EventEmitter<void>();
  @Input() backgroundColor: string = "";

  combinedItemsMap = new Map<number, any[]>();
  showHandles = false;
  groupBoxStyle: SafeStyle = "";
  groupIconStyle: SafeStyle = "";
  iconRowStyle: SafeStyle = "";
  groupFontStyle: SafeStyle = "";
  groupBackgroundColor: string = "";
  isSmallScreen = false;
  groupIconColor: string = ""; 

  constructor(
    private dropService: DashboardDropService,
    private dialog: MatDialog,
    private statusService: StatusMessageService,
    private settingsService: SettingsService,
    private sanitizer: DomSanitizer,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.settingsService.loadSettings().subscribe((settings) => {
      const bgColor = settings["GROUP_BACKGROUND_COLOR"] || "#ffffff";
      const opacity = parseFloat(settings["GROUP_BACKGROUND_OPACITY"] || "1");
      const borderColor = settings["GROUP_BORDER_COLOR"] || "#000000";
      const borderWidth = settings["GROUP_BORDER_WIDTH"] || "1";
      const fontColor = settings["GROUP_FONT_COLOR"] || "#ffffff";
      const fontWeight = settings["GROUP_FONT_WEIGHT"] || "400";
      const fontSize = settings["GROUP_FONT_SIZE"] || "14";
      const iconColor = settings["GROUP_FOOTER_ICON_COLOR"] || "#000000";
      const groupIconColor = settings["GROUP_ICON_COLOR"] || "#000000";
      const footerBgHex =
        settings["GROUP_FOOTER_BACKGROUND_COLOR"] || "#2e3a46";
      const footerOpacity = parseFloat(
        settings["GROUP_FOOTER_BACKGROUND_OPACITY"] || "1.0"
      );
      const footerBgRgba = this.hexToRgba(footerBgHex, footerOpacity);
      const borderRadius = settings["GROUP_BORDER_CORNER_RADIUS"] || "2";

      const rgba = this.hexToRgba(bgColor, opacity);

      this.groupBackgroundColor = rgba;

      this.groupBoxStyle = this.sanitizer.bypassSecurityTrustStyle(`
        background-color: ${rgba};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: ${borderRadius}px;
      `);

      this.iconRowStyle = this.sanitizer.bypassSecurityTrustStyle(`
        background-color: ${footerBgRgba};
        color: ${iconColor};
        border-bottom-left-radius: ${borderRadius}px;
        border-bottom-right-radius: ${borderRadius}px;
      `);

      this.groupFontStyle = this.sanitizer.bypassSecurityTrustStyle(`
        color: ${fontColor};
        font-weight: ${fontWeight};
        font-size: ${fontSize}px;
      `);

      this.groupIconStyle = this.sanitizer.bypassSecurityTrustStyle(`
        color: ${groupIconColor};
        font-weight: ${fontWeight};
        font-size: ${fontSize}px;
      `);

    });
    this.breakpointObserver
      .observe([Breakpoints.Tablet, Breakpoints.Handset])
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
      });
  }

  getCombinedItemsCached(group: any): any[] {
    if (!group || typeof group.id !== "number") return [];

    if (!this.combinedItemsMap.has(group.id)) {
      const links = (group.links || [])
        .filter((item: any) => item && typeof item.id === "number")
        .map((item: any) => ({
          ...item,
          type: "link",
        }));

      const lists = (group.lists || [])
        .map((item: any) => ({
          ...item,
          id: Number(item.id),
          type: "list",
        }))
        .filter((item: any) => typeof item.id === "number" && !isNaN(item.id));

      const combined = [...lists, ...links].sort(
        (a, b) => a.position - b.position
      );

      this.combinedItemsMap.set(group.id, combined);
    }

    return this.combinedItemsMap.get(group.id) || [];
  }

  openListDialog(list: any, groupId?: number) {
    let width = "50%";

    if (this.breakpointObserver.isMatched(Breakpoints.Handset)) {
      width = "100%";
    } else if (this.breakpointObserver.isMatched(Breakpoints.Tablet)) {
      width = "80%";
    } else {
      width = "50%";
    }

    const dialogRef = this.dialog.open(DialogListComponent, {
      width,
      maxWidth: "1000px",
      maxHeight: "80vh",
      data: { list, groupId },
    });

    const instance = dialogRef.componentInstance;

    instance.listAdded.subscribe(() => {
      this.combinedItemsMap.delete(groupId || list.groupId);
      this.refreshGroups();
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.created) {
        this.combinedItemsMap.clear();
        this.refreshGroups();
      }
    });
  }

  dropCombined(event: CdkDragDrop<any[]>, group: any) {
    const movedItem = event.item.data;

    if (
      !movedItem?.type ||
      (movedItem.type !== "list" && movedItem.type !== "link")
    ) {
      console.warn(
        "⚠️ Unknown or unsupported item type in dropCombined:",
        movedItem
      );
      this.statusService.show("Unsupported item type.", "error");
      return;
    }

    if (
      (movedItem.type === "link" && typeof movedItem.id !== "number") ||
      (movedItem.type === "list" && isNaN(Number(movedItem.id)))
    ) {
      console.error("❌ Invalid item ID for drop operation:", movedItem);
      this.statusService.show("Invalid item ID.", "error");
      return;
    }

    this.handleItemDrop(event, group, movedItem.type as "list" | "link");
  }

  private handleItemDrop(
    event: CdkDragDrop<any[]>,
    targetGroupData: any,
    itemType: "list" | "link"
  ): void {
    const prevContainer = event.previousContainer;
    const currContainer = event.container;
    const movedItem = event.item.data;
    const movedItemId = Number(movedItem.id);
    const targetGroupId = Number(targetGroupData.id);

    if (isNaN(movedItemId) || isNaN(targetGroupId)) {
      console.error(
        `❌ Invalid moved ${itemType} ID (${movedItem.id}) or targetGroupId (${targetGroupId}).`
      );
      this.statusService.show("Error: Invalid item or group ID.", "error");
      return;
    }

    const sourceGroup = this.category.groups.find(
      (g: any) => `combined-drop-${g.id}` === prevContainer.id
    );
    const destinationGroup = this.category.groups.find(
      (g: any) => `combined-drop-${g.id}` === currContainer.id
    );

    if (!destinationGroup) {
      console.error("❌ Target group not found for drop operation.");
      this.statusService.show("Error: Target group not found.", "error");
      return;
    }
    if (prevContainer !== currContainer && !sourceGroup) {
      console.warn(
        "⚠️ Source group not found for moved item. Assuming it originated from a different context or was already removed."
      );
    }

    const sourceCombinedItems = sourceGroup
      ? [...this.getCombinedItemsCached(sourceGroup)]
      : [];
    let destinationCombinedItems = [
      ...this.getCombinedItemsCached(destinationGroup),
    ];

    const itemDataForNewList = {
      ...movedItem,
      id: movedItemId,
      type: itemType,
      ...(itemType === "list" && { groupId: targetGroupId }),
    };

    if (prevContainer === currContainer) {
      moveItemInArray(
        destinationCombinedItems,
        event.previousIndex,
        event.currentIndex
      );

      destinationCombinedItems.forEach(
        (item, index) => (item.position = index)
      );
      const reorderedPayloadForBackend = destinationCombinedItems.map(
        (item) => ({
          id: Number(item.id),
          position: item.position,
          type: item.type,
        })
      );

      let backendCall$: Observable<any>;
      const listsToReorder = reorderedPayloadForBackend.filter(
        (item) => item.type === "list"
      );
      const linksToReorder = reorderedPayloadForBackend.filter(
        (item) => item.type === "link"
      );

      const bulkOperations: Observable<any>[] = [];

      if (listsToReorder.length > 0) {
        bulkOperations.push(
          this.dropService.reorderLists(
            targetGroupId,
            listsToReorder.map((l) => ({ id: l.id, position: l.position }))
          )
        );
      }
      if (linksToReorder.length > 0) {
        bulkOperations.push(
          this.dropService.reorderLinks(
            linksToReorder.map((l) => ({ id: l.id, position: l.position }))
          )
        );
      }

      if (bulkOperations.length > 0) {
        forkJoin(bulkOperations).subscribe({
          next: () => {},
          error: (err: any) => {
            console.error(
              `❌ Error reordering items in group ${targetGroupId}:`,
              err
            );
            this.statusService.show(
              `Error saving item order. Reverting changes.`,
              "error"
            );
            this.refreshGroups();
          },
        });
      }
    } else {
      if (sourceGroup) {
        const itemIndexInSource = sourceCombinedItems.findIndex(
          (item) => item.type === itemType && item.id === movedItemId
        );
        if (itemIndexInSource > -1) {
          sourceCombinedItems.splice(itemIndexInSource, 1);
          sourceCombinedItems.forEach((item, index) => (item.position = index));
          this.combinedItemsMap.set(sourceGroup.id, sourceCombinedItems);
          this.cdr.detectChanges();
        } else {
          console.warn(
            `⚠️ Moved ${itemType} (ID: ${movedItemId}) not found in source group (${sourceGroup.id}) cache for removal.`
          );
        }
      }
      destinationCombinedItems.splice(
        event.currentIndex,
        0,
        itemDataForNewList
      );
      destinationCombinedItems.forEach(
        (item, index) => (item.position = index)
      );
      const reorderedPayloadForBackend = destinationCombinedItems.map(
        (item) => ({
          id: Number(item.id),
          position: item.position,
          type: item.type,
        })
      );

      let backendCall$: Observable<any>;
      const movedItemPayload = {
        id: movedItemId,
        position: event.currentIndex,
      };

      if (itemType === "list") {
        backendCall$ = this.dropService.moveAndReorderList(
          movedItemId,
          targetGroupId,
          reorderedPayloadForBackend.filter((i) => i.type === "list")
        );
      } else {
        backendCall$ = this.dropService.moveAndReorderLink(
          movedItemId,
          targetGroupId,
          reorderedPayloadForBackend.filter((i) => i.type === "link")
        );
      }

      backendCall$.subscribe({
        next: () => {},
        error: (err: any) => {
          console.error(
            `❌ Error moving ${itemType} ID ${movedItemId} to group ${targetGroupId}:`,
            err
          );
          this.statusService.show(
            `Error saving ${itemType} move. Reverting changes.`,
            "error"
          );
          this.refreshGroups();
        },
      });
    }
    destinationGroup.links = destinationCombinedItems.filter(
      (i) => i.type === "link"
    );
    destinationGroup.lists = destinationCombinedItems.filter(
      (i) => i.type === "list"
    );
    this.rebuildCombinedItems(destinationGroup);
    this.cdr.detectChanges();
  }

  getConnectedDropLists(): string[] {
    return this.category.groups.map((g: any) => "combined-drop-" + g.id);
  }

  openAddListDialog(groupId: number) {
    const dialogRef = this.dialog.open(DialogAddListComponent, {
      width: "400px",
      data: { groupId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.created) {
        this.combinedItemsMap.delete(groupId);
        this.refreshGroups();
      }
    });
  }

  hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  allowGroupDrag(): void {
    this.isGroupDraggable = false;
  }

  preventGroupDrag(): void {
    this.isGroupDraggable = true;
  }

  trackLinkById(index: number, item: any): number {
    return item.id;
  }

  toggleHandles() {
    this.showHandles = !this.showHandles;

    if (this.showHandles) {
      this.statusService.show("Drag and drop enabled", "success", true);
    } else {
      this.statusService.clearPersistent();
      this.statusService.clear();
    }
  }

  openAddGroupDialog(categoryId: number): void {
    const dialogRef = this.dialog.open(DialogAddGroupComponent, {
      width: "400px",
      data: { categoryId },
    });

    const instance = dialogRef.componentInstance;

    instance.groupAdded.subscribe(() => {
      this.refreshGroups();
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshGroups();
    });
  }

  dropLink(event: CdkDragDrop<any[]>, group: any) {
    const prevContainer = event.previousContainer;
    const currContainer = event.container;

    if (prevContainer === currContainer) {
      moveItemInArray(group.links, event.previousIndex, event.currentIndex);

      const reorderedLinks = group.links.map((link: any, index: number) => ({
        id: link.id,
        position: index,
      }));

      this.dropService.reorderLinks(reorderedLinks).subscribe({
        error: (err) => console.error("Failed to reorder links", err),
      });
    } else {
      const movedLink = prevContainer.data[event.previousIndex];

      prevContainer.data.splice(event.previousIndex, 1);

      currContainer.data.splice(event.currentIndex, 0, movedLink);

      this.dropService.updateLinkGroup(movedLink.id, group.id).subscribe({
        next: () => {
          const reorderedLinks = group.links.map(
            (link: any, index: number) => ({
              id: link.id,
              position: index,
            })
          );

          this.dropService.reorderLinks(reorderedLinks).subscribe({
            error: (err) =>
              console.error("Failed to reorder links after moving", err),
          });
        },
        error: (err) => console.error("Failed to update link group", err),
      });
    }
  }

  openAddLinkDialog(groupId: number): void {
    const dialogRef = this.dialog.open(DialogAddLinkComponent, {
      width: "500px",
      data: { groupId },
    });

    dialogRef.componentInstance.linkAdded.subscribe(() => {
      this.clearCombinedItemsForGroup(groupId);
      this.refreshGroups();
    });

    dialogRef.afterClosed().subscribe(() => {
      this.clearCombinedItemsForGroup(groupId);
      this.refreshGroups();
    });
  }

  handleListDeleted(groupId: number) {
    this.clearCombinedItemsForGroup(groupId);
    this.refreshGroups();
  }

  handleLinkDeleted(groupId: number) {
    this.clearCombinedItemsForGroup(groupId);
    this.refreshGroups();
    this.cdr.detectChanges();
  }

  openEditLinksDialog(categoryId: number, groupId: number): void {
    const dialogRef = this.dialog.open(DialogManageLinksComponent, {
      width: "700px",
      data: {
        categoryId,
        groupId,
        showGroupEditor: true,
      },
    });

    const instance = dialogRef.componentInstance;
    instance.groupNameUpdated.subscribe(() => {
      this.refreshRequested.emit();
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshRequested.emit();
    });
  }

  deleteGroup(group: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: "Delete Group",
        message: `Are you sure you want to delete the group "${group.name}"? This will also delete all links in the group.`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dropService.deleteGroup(group.id).subscribe({
          next: () => {
            this.refreshRequested.emit();
          },
          error: (err) => console.error("Failed to delete group", err),
        });
      }
    });
  }

  dropGroup(event: CdkDragDrop<any[]>, category: any) {
    moveItemInArray(category.groups, event.previousIndex, event.currentIndex);

    const reordered = category.groups.map((group: any, index: number) => ({
      id: group.id,
      position: index,
    }));

    this.dropService.reorderGroups(this.category.id, reordered).subscribe({
      error: (err) => console.error("Error saving group reorder", err),
    });
  }

  moveGroupToCategory(group: any, newCategoryId: number): void {
    const targetCategory = this.categories.find((c) => c.id === newCategoryId);
    const nextPosition = targetCategory?.groups?.length || 0;

    this.dropService
      .updateGroup(group.id, {
        categoryId: newCategoryId,
        position: nextPosition,
      })
      .subscribe({
        next: () => {
          this.groupMoved.emit();
        },
        error: (err) => console.error("Failed to move group", err),
      });
  }

  refreshGroups() {
    this.combinedItemsMap.clear();
    this.dropService.fetchCategories().subscribe({
      next: (data) => {
        const currentCategory = data.find((c) => c.id === this.category.id);
        if (currentCategory) {
          const updatedGroups = currentCategory.groups.map((group: any) => {
            const links = [...(group.links || [])];
            const lists = [...(group.lists || [])];
            const combined = [
              ...lists.map((l) => ({ ...l, type: "list" })),
              ...links.map((l) => ({ ...l, type: "link" })),
            ];
            combined.sort((a, b) => a.position - b.position);
            this.combinedItemsMap.set(group.id, combined);
            return { ...group, links, lists };
          });

          this.category = {
            ...this.category,
            groups: updatedGroups,
          };
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error refreshing groups", err),
    });
  }

  handleLinkUpdated(groupId: number, updatedLink: any) {
    const group = this.category.groups.find(
      (g: { id: number }) => g.id === groupId
    );
    if (group) {
      const index = group.links.findIndex(
        (l: { id: any }) => l.id === updatedLink.id
      );
      if (index > -1) {
        group.links[index] = updatedLink;
        this.rebuildCombinedItems(group);
        this.cdr.detectChanges();
      }
    }
  }

  clearCombinedItemsForGroup(groupId: number) {
    this.combinedItemsMap.delete(groupId);
  }

  openManageGroupsDialog(categoryId?: number, groupId?: number): void {
    const dialogRef = this.dialog.open(DialogManageLinkGroupsComponent, {
      width: "600px",
      data: {
        categoryId,
        groupId,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.refreshRequested.emit();
    });
  }

  onMoveGroup(event: { group: any; newCategoryId: number }) {
    const { group, newCategoryId } = event;
    this.dropService
      .updateGroup(group.id, {
        categoryId: newCategoryId,
        position:
          this.categories.find((c) => c.id === newCategoryId)?.groups.length ||
          0,
      })
      .subscribe({
        next: () => {
          this.refreshRequested.emit();
        },
        error: (err) => console.error("Failed to move group", err),
      });
  }

  rebuildCombinedItems(group: any) {
    const links = (group.links || [])
      .filter((item: any) => item && typeof item.id === "number")
      .map((item: any) => ({
        ...item,
        type: "link",
      }));

    const lists = (group.lists || [])
      .map((item: any) => ({
        ...item,
        id: Number(item.id),
        type: "list",
      }))
      .filter((item: any) => typeof item.id === "number" && !isNaN(item.id));

    const combined = [...lists, ...links].sort(
      (a, b) => a.position - b.position
    );
    this.combinedItemsMap.set(group.id, combined);
  }
}
