import { Component } from '@angular/core';
import { SiteFooter } from '../site-footer/site-footer';
import { SiteNavbar } from '../site-navbar/site-navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-site-layout',
  imports: [RouterOutlet, SiteFooter, SiteNavbar],
  templateUrl: './site-layout.html',
  styleUrl: './site-layout.css',
})
export class SiteLayout {

}
