import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../settings-components/app-settings/settings.service';

@Component({
  selector: 'app-ui-loader',
  imports: [CommonModule],
  templateUrl: './ui-loader.component.html',
  styleUrl: './ui-loader.component.css'
})
export class UiLoaderComponent {

    styleSettings = {
    groupBackgroundColor: '',
    groupFontColor: '',
  };

    constructor(
    private settingsService: SettingsService
  ) {}

    ngOnInit() {
        this.settingsService.loadSettings().subscribe({
          next: (settings) => {
            this.styleSettings.groupBackgroundColor =
              settings['GROUP_BACKGROUND_COLOR'] || '#2e3a46';
            this.styleSettings.groupFontColor =
              settings['GROUP_FONT_COLOR'] || '#ffffff';
          },
          error: (err) => {
            console.error('❌ Failed to load settings:', err);
          },
        });
  }

}
