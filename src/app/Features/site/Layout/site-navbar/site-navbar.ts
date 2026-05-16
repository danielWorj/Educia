import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-site-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-navbar.html',
  styleUrl: './site-navbar.css',
})
export class SiteNavbar {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}