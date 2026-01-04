# Project Context: thegioicuongphim

## Overview
`thegioicuongphim` is a React-based web application designed for streaming movies and TV shows. It features a modern UI built with Bootstrap 5, utilizes Redux Toolkit for state management (specifically for user favorites), and employs React Router v6 for navigation with lazy loading for performance optimization.

## Tech Stack
- **Frontend Framework:** React 18
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing:** React Router DOM v6 (`react-router-dom`)
- **Styling:** Tailwind CSS (Primary), shadcn/ui (Components), Framer Motion (Animations/ReactBits)
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Form Handling:** Formik + Yup
- **UI Components:** Swiper (for sliders)
- **Tooling:** Create React App (`react-scripts`)

## Architecture & Directory Structure
- **`src/`**: Source code root.
  - **`assets/`**: Static assets like icons and logos.
  - **`components/`**: Reusable UI components.
    - **`common/`**: Global components (Header, Footer, Search).
    - **`home/`**: Home page specific components (HeroSpotlight, FilmGrid).
    - **`layout/`**: Layout wrappers.
    - **`ui/`**: Basic UI elements (Buttons, Inputs).
  - **`containers/`**: Larger composite components (Cards, Video player, Pagination).
  - **`data/`**: Static data files.
  - **`hooks/`**: Custom React hooks (`useFilmDetail`, `useTheme`).
  - **`pages/`**: Main page views (Home, Detail, Watch, SignUp), lazy loaded in `App.js`.
  - **`services/`**: API communication logic (`apiClient.js` setup, `getFilm.js`, etc.).
  - **`store/`**: Redux store configuration and slices (`favoritesSlice`).
  - **`utils/`**: Helper functions (date formatting, slugify).

## Key Files
- **`src/App.js`**: Main application component containing route definitions and lazy loading setup.
- **`src/store/index.js`**: Redux store entry point.
- **`src/services/apiClient.js`**: Axios instance configuration with interceptors.
- **`jsconfig.json`**: Configures path aliases (`@/*` mapped to `./src/*`).

## Development
### Scripts
- `npm start`: Runs the app in development mode at [http://localhost:3000](http://localhost:3000).
- `npm build`: Builds the app for production to the `build` folder.
- `npm test`: Launches the test runner.

### Conventions
- **Path Aliases:** Use `@/` for `src/` root and `@components/` for `src/components/` to avoid long relative paths.
- **State:** Use Redux for global application state (like Favorites). Use local `useState`/`useReducer` for component-specific state.
- **Styling:** Prefer Bootstrap utility classes where possible, falling back to `App.css` or `index.css` for custom styles.
- **Environment:** API URL is configured via `REACT_APP_API_URL` environment variable.

## Future Architecture (OTT Platform Vision)
### 1. Backend Architecture (Planned)
- **Model:** REST/GraphQL Microservices (Auth, Content, Playback, Subscription).
- **Stack:** Laravel/NestJS + MySQL/PostgreSQL + Redis + Elasticsearch.
- **Streaming:** HLS + Adaptive Bitrate + CDN (CloudFront/Cloudflare).
- **Core Services:**
  - **Auth:** JWT, Multi-device session.
  - **Content:** Movies, Series, Cast, Genres.
  - **Playback:** Secure token, Watch history, Resume.

### 2. UI/UX Design System (Target)
- **Visuals:** Dark Mode (#0f0f0f), Cinematic Motion, "Invisible" UI.
- **Patterns:**
  - Top Navbar (Web) / Simple Navigation.
  - Home: Hero Banner (1 highlight) + Horizontal Scrolls (Trending, Categories).
  - Movie Card: 2:3 Poster, Hover Scale, Minimal Info.
  - Player: Fullscreen focus, Auto-hide controls.

