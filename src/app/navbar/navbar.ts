import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">Converter Tools</a>
        <ul class="nav-links">
          <li>
            <a routerLink="/image-to-base64" routerLinkActive="active">Image to Base64</a>
          </li>
          <li>
            <a routerLink="/sha1" routerLinkActive="active">String to SHA1</a>
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
    }

    .nav-brand {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;

      &:hover {
        color: #3498db;
      }
    }

    .nav-links {
      list-style: none;
      display: flex;
      gap: 2rem;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      color: #ecf0f1;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        background-color: #34495e;
        color: white;
      }

      &.active {
        background-color: #3498db;
        color: white;
      }
    }
  `,
})
export class Navbar {}
