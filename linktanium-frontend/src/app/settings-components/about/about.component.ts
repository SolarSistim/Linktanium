import { Component } from '@angular/core';
import { SmallTitleComponent } from '../../ui-components/small-title/small-title.component';
import { environment } from '../../../environment/environment.prod';

@Component({
  selector: 'app-about',
  imports: [SmallTitleComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  version = environment.version;

}
