import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { debounceTime, map, startWith } from "rxjs/operators";
import { DashboardDropService } from "../../features/dashboard-drop/dashboard-drop.service";
import { SettingsService } from "../../settings-components/app-settings/settings.service";
import { MatDividerModule } from "@angular/material/divider";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { ListsService } from "../lists/lists.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogListComponent } from "../../dialogs/dialog-list/dialog-list.component";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";

@Component({
  selector: "app-search",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    DialogListComponent,
    MatAutocompleteTrigger,
  ],
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, AfterViewInit {
  
  @ViewChild("searchInput", { static: true })
  searchInputRef!: ElementRef<HTMLInputElement>;
  @Output() openListRequested = new EventEmitter<{
    list: any;
    groupId?: number;
  }>();
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;
  allLists: any[] = [];
  searchControl = new FormControl("");
  allLinks: any[] = [];
  filteredLinks: any[] = [];
  searchProviderName = "";
  searchProviderUrl = "";
  rawSearchQuery = "";
  showFilterOptions = false;
  filterByName = true;
  filterByDescription = true;
  filteredLists: any[] = [];
  allListItems: any[] = [];
  filteredListItems: any[] = [];
  filterByListName = true;
  filterByListItem = true;
  searchBorderColor = "#ffffff";
  searchBorderWidth = 2;
  searchFontColor = "#ffffff";
  searchBackgroundColor = "#000000";
  searchBackgroundOpacity = 0.4;
  searchCornerRadius: any;
  allCategories: any[] = [];

  constructor(
    private dashboardService: DashboardDropService,
    private settingsService: SettingsService,
    private listsService: ListsService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver 
  ) {}

  get cardBackgroundRgba(): string {
    const hex = this.searchBackgroundColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${this.searchBackgroundOpacity})`;
  }

  ngOnInit(): void {

    this.dashboardService.getAllLinks().subscribe((links) => {
      this.allLinks = links;
    });

    this.dashboardService.getFullDashboard().subscribe((categories) => {
      this.allCategories = categories;
    });

    this.listsService.getAllLists().subscribe((lists) => {
      this.allLists = lists;
    });

    this.listsService.getAllListItems().subscribe((items) => {
      this.allListItems = items;
    });

    this.settingsService.loadSettings().subscribe((settings) => {
      this.searchProviderName =
        settings["SEARCH_FEATURE_PROVIDER_NAME"] || "Google";
      this.searchProviderUrl =
        settings["SEARCH_FEATURE_QUERY_URL"] ||
        "https://www.google.com/search?q=";

      this.searchBackgroundColor =
        settings["SEARCH_FEATURE_BACKGROUND_COLOR"] || "#000000";
      this.searchBackgroundOpacity = parseFloat(
        settings["SEARCH_FEATURE_BACKGROUND_OPACITY"] || "1.0"
      );

      this.searchBorderColor =
        settings["SEARCH_FEATURE_BORDER_COLOR"] || "#ffffff";
      this.searchBorderWidth = parseInt(
        settings["SEARCH_FEATURE_BORDER_WIDTH"] || "2",
        10
      );
      this.searchFontColor = settings["SEARCH_FEATURE_FONT_COLOR"] || "#ffffff";
      this.searchCornerRadius = parseInt(
        settings["SEARCH_FEATURE_CORNER_RADIUS"]
      );
    });

    this.searchControl.valueChanges
  .pipe(
    debounceTime(150),
    startWith(""),
    map((value) => {
      if (typeof value === "string") {
        this.rawSearchQuery = value;
        return value.toLowerCase();
      }
      return "";
    })
  )
  .subscribe((query) => {
    const lowerQuery = query.toLowerCase();

    const seenLinks = new Set<string>();
    this.filteredLinks = this.allLinks
      .filter((link) => {
        const nameMatch =
          this.filterByName &&
          link.name?.toLowerCase().includes(lowerQuery);
        const descMatch =
          this.filterByDescription &&
          link.description?.toLowerCase().includes(lowerQuery);
        return nameMatch || descMatch;
      })
      .filter((link) => {
        const lowerName = link.name.toLowerCase();
        if (seenLinks.has(lowerName)) return false;
        seenLinks.add(lowerName);
        return true;
      });

    this.filteredListItems = this.filterByListItem
      ? this.allListItems.filter((item) => {
          const titleMatch = item.title?.toLowerCase().includes(lowerQuery);
          const descMatch = item.description
            ?.toLowerCase()
            .includes(lowerQuery);
          return titleMatch || descMatch;
        })
      : [];

    this.filteredLists = this.filterByListName
      ? this.allLists.filter((list) =>
          list.name?.toLowerCase().includes(lowerQuery)
        )
      : [];

    // ✅ New: Filter groups that match the query and collect their links and lists
    this.filteredGroupsWithItems = [];
    if (query && this.allCategories?.length > 0) {
      for (const category of this.allCategories) {
        for (const group of category.groups || []) {
          const groupMatch = group.name?.toLowerCase().includes(lowerQuery);
          if (groupMatch) {
            this.filteredGroupsWithItems.push({
              groupName: group.name,
              groupId: group.id,
              links: group.links || [],
              lists: group.lists || [],
            });
          }
        }
      }
    }
  });
    document.documentElement.style.setProperty('--optgroup-bg', this.searchBackgroundColor);
    document.documentElement.style.setProperty('--optgroup-color', this.searchFontColor);

  }

  onListSelected(list: any): void {
    this.openListDialog(list, list.group?.id);
    this.clearSearch();
  }

  onListItemSelected(item: any): void {
    if (item.list) {
      this.openListDialog(item.list, item.list.group?.id);
      this.clearSearch();
    }
  }

  openListDialog(list: any, groupId?: number) {
    let width = "50%";

    if (this.breakpointObserver.isMatched(Breakpoints.Handset)) {
      width = "100%";
    } else if (this.breakpointObserver.isMatched(Breakpoints.Tablet)) {
      width = "80%";
    }

    const dialogRef = this.dialog.open(DialogListComponent, {
      width,
      maxWidth: "1000px",
      maxHeight: "80vh",
      data: { list, groupId },
    });

    const instance = dialogRef.componentInstance;

    if (instance.listAdded) {
      instance.listAdded.subscribe(() => {
      });
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.created) {
        return;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.searchInputRef.nativeElement.focus();
      this.autocompleteTrigger.closePanel();
    });
  }

  deselectAllFilters(): void {
    this.filterByName = false;
    this.filterByDescription = false;
    this.filterByListName = false;
    this.filterByListItem = false;
  }

  get allFiltersSelected(): boolean {
    return (
      this.filterByName &&
      this.filterByDescription &&
      this.filterByListName &&
      this.filterByListItem
    );
  }

  toggleAllFilters(): void {
    const newState = !this.allFiltersSelected;
    this.filterByName = newState;
    this.filterByDescription = newState;
    this.filterByListName = newState;
    this.filterByListItem = newState;
    this.updateSearchControlState();
  }

  get isSearchDisabled(): boolean {
    return (
      !this.filterByName &&
      !this.filterByDescription &&
      !this.filterByListName &&
      !this.filterByListItem
    );
  }

  updateSearchControlState(): void {
    if (this.isSearchDisabled) {
      this.searchControl.disable({ emitEvent: false });
    } else {
      this.searchControl.enable({ emitEvent: false });
    }
  }

  clearSearch(): void {
    this.searchControl.setValue("");
    this.rawSearchQuery = "";
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedValue = event.option.value;

    if (selectedValue === "SEARCH_EXTERNAL") {
      this.searchExternal();
    } else if (selectedValue?.url) {
      this.openLink(selectedValue);
    }

    this.searchControl.setValue("");
    this.rawSearchQuery = "";
  }

  handleEnter(): void {
    const query = this.searchControl.value?.trim();
    if (query) this.searchExternal();
  }

  searchExternal(): void {
    const query = this.rawSearchQuery.trim();
    if (!query) return;

    let base = this.searchProviderUrl;

    if (!base.includes("?")) {
      base += "?q=";
    } else if (!base.includes("q=")) {
      base += base.endsWith("&") ? "" : "&";
      base += "q=";
    }

    const url = base + encodeURIComponent(query);
    window.open(url, "_blank");
  }

  openLink(link: any): void {
    if (link.url) {
      window.open(link.url, "_blank");
    }
  }

  getIconUrl(iconFilename: string): string {
    return `/assets/icons/${iconFilename}`;
  }

  onFocus(): void {
    const currentValue = this.searchControl.value || "";
    this.searchControl.setValue(currentValue);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.getIconUrl("default.png");
  }

  onSearchSelected(): void {
    setTimeout(() => {
      this.searchExternal();
    }, 0);
  }

    filteredGroupsWithItems: {
      groupName: string;
      groupId: number;
      links: any[];
      lists: any[];
    }[] = [];

}
