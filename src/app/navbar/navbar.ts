import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">Converter Tools</a>
        <button
          class="hamburger"
          (click)="toggleMenu()"
          [class.active]="isMenuOpen()"
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="nav-links" [class.active]="isMenuOpen()">
          <li>
            <a routerLink="/image-to-base64" routerLinkActive="active" (click)="closeMenu()"
              >Image to Base64</a
            >
          </li>
          <li>
            <a routerLink="/sha1" routerLinkActive="active" (click)="closeMenu()">SHA1</a>
          </li>
          <li>
            <a routerLink="/jwt" routerLinkActive="active" (click)="closeMenu()">JWT Decoder</a>
          </li>
          <li>
            <a routerLink="/color-picker" routerLinkActive="active" (click)="closeMenu()"
              >Color Picker</a
            >
          </li>
          <li>
            <a routerLink="/text-compare" routerLinkActive="active" (click)="closeMenu()"
              >Text Compare</a
            >
          </li>
          <li>
            <a routerLink="/json-formatter" routerLinkActive="active" (click)="closeMenu()"
              >JSON Formatter</a
            >
          </li>
          <li>
            <a routerLink="/word-counter" routerLinkActive="active" (click)="closeMenu()"
              >Word Counter</a
            >
          </li>
          <li>
            <a routerLink="/lorem-ipsum" routerLinkActive="active" (click)="closeMenu()"
              >Lorem Ipsum</a
            >
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      background-color: #2c3e50;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }

    .nav-brand {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
      z-index: 1001;

      &:hover {
        color: #3498db;
      }
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.75rem;
      z-index: 1001;
      position: relative;
      width: 44px;
      height: 44px;
      justify-content: center;
      align-items: center;

      span {
        display: block;
        width: 26px;
        height: 3px;
        background-color: white;
        transition: all 0.3s ease;
        border-radius: 2px;
      }

      &.active span:nth-child(1) {
        transform: rotate(45deg) translate(9px, 9px);
        background-color: #e74c3c;
      }

      &.active span:nth-child(2) {
        opacity: 0;
      }

      &.active span:nth-child(3) {
        transform: rotate(-45deg) translate(8px, -8px);
        background-color: #e74c3c;
      }

      &:hover span {
        background-color: #3498db;
      }

      &.active:hover span {
        background-color: #c0392b;
      }
    }

    .nav-links {
      list-style: none;
      display: flex;
      gap: 1rem;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      color: #ecf0f1;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
      white-space: nowrap;

      &:hover {
        background-color: #34495e;
        color: white;
      }

      &.active {
        background-color: #3498db;
        color: white;
      }
    }

    @media (max-width: 768px) {
      .hamburger {
        display: flex;
      }

      .nav-links {
        position: fixed;
        top: 0;
        right: -100%;
        height: 100vh;
        width: 70%;
        max-width: 300px;
        background-color: #2c3e50;
        flex-direction: column;
        padding: 5rem 2rem 2rem;
        gap: 0;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
        transition: right 0.3s ease;
        z-index: 1000;

        &.active {
          right: 0;
        }

        li {
          width: 100%;
          border-bottom: 1px solid #34495e;
        }

        a {
          display: block;
          width: 100%;
          padding: 1rem;
          border-radius: 0;
        }
      }
    }
  `,
})
export class Navbar {
  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
