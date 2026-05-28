# Implementation Plan: RX STREAM Live Streaming Website

Build a modern, Netflix-inspired live streaming aggregator called "RX STREAM" featuring free channels from Roku, Tubi, and International sources.

## Scope Summary
- **UI/UX**: Dark theme (Cyan/Purple accents), responsive sidebar + main content layout.
- **Data**: Fetch and parse `.m3u` / `.m3u8` playlists from public GitHub sources.
- **Player**: Hls.js integrated video player with custom controls (Quality, PiP, Fullscreen).
- **Features**: Search, Filtering, Favorites, History, Multi-playlist support, Keyboard shortcuts.
- **Persistence**: Client-side only (localStorage).
- **Format**: Though requested as a single HTML file, we will build it as a structured React application within this sandbox for better maintainability and performance, utilizing existing UI components.

## Affected Areas
- **Frontend (React)**: Main application logic, state management for channels.
- **UI Components**: Sidebar, Header, Channel Cards, Video Player, Stats Bar.
- **Data Layer**: Fetching M3U files, parsing them into JSON, and filtering.
- **Persistence**: localStorage for favorites and history.

## Phases

### Phase 1: Core Layout & Styling (frontend_engineer)
- Set up the main layout using a Sidebar and Main Content area.
- Implement the "RX STREAM" branding with Cyan (#00e5ff) and Purple (#7c3aed) highlights.
- Configure the dark theme as default.
- **Deliverable**: Responsive shell with sticky header and functional sidebar.

### Phase 2: Data Fetching & Parsing (frontend_engineer)
- Create a utility to fetch `.m3u` playlists from the provided URLs.
- Implement an M3U parser to extract Channel Name, Stream URL, Logo, and Category.
- Implement a CORS proxy solution (e.g., `https://cors-anywhere.herokuapp.com/` or similar public proxy if needed for direct M3U fetching).
- **Deliverable**: Raw channel data available in application state.

### Phase 3: Channel Management & UI (frontend_engineer)
- Build the Channel Grid/List view with toggle.
- Implement Search and Category filters.
- Implement Playlist switching (Roku, Tubi, Free-TV).
- Add "Favorite" and "History" logic using localStorage.
- **Deliverable**: Interactive channel list with filtering and persistence.

### Phase 4: Video Player Integration (frontend_engineer)
- Integrate `hls.js` for `.m3u8` stream playback.
- Build custom player controls: Play/Pause, Volume, Fullscreen, PiP, Quality Selector.
- Implement "Recently Watched" auto-update on play.
- Add Error Handling for dead links and Loading Spinners.
- **Deliverable**: Fully functional video player with streaming capabilities.

### Phase 5: Advanced Features & Refinement (quick_fix_engineer)
- Implement Keyboard Shortcuts (Space for Play/Pause, F for Fullscreen).
- Add Share functionality (Web Share API or simple URL copy).
- Add "Report Dead Link" placeholder/toast.
- Final CSS polish and responsive testing.
- **Deliverable**: Completed feature set and polished UX.

## Assumptions & Risks
- **CORS**: M3U files on GitHub might require a proxy to be fetched from a browser. We will use a fallback or proxy approach.
- **Stream Availability**: Public M3U streams are volatile. The "Report Dead Link" and "Error Handling" are critical.
- **Performance**: Large playlists (Tubi has thousands) may need virtualization or pagination to keep the UI smooth.

## Downstream Ownership
- **frontend_engineer**: Primary owner for Phases 1-4.
- **quick_fix_engineer**: Secondary owner for Phase 5 and UI tweaks.