import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent implements AfterViewInit {
  title = 'Project';

  ngAfterViewInit() {
    const licenseElement = document.querySelector('dx-license');
    console.log(licenseElement);
    if (licenseElement) {
      licenseElement.remove();
    }
  };
}
