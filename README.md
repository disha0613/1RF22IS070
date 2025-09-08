# URL Shortener Prototype – Frontend (React + Vite)

A lightweight, in-browser URL shortener prototype with a React + Vite frontend. All state is kept in-browser (no backend). Features include single and batch shortening, custom aliases, optional validity periods, and a statistics page.

---

## Tech Stack

- **Frontend**: React 19 + Vite 7
- **Styling**: Vanilla CSS (neutral black/white theme)
- **Clipboard**: Native Clipboard API
- **Project Structure**: `frontend/Url-shortener`

---

## Project Structure

```
frontend/Url-shortener
├── index.html                 # Vite entry
├── src/
│   ├── main.jsx               # React bootstrap
│   ├── App.jsx                # App logic: shorten, batch, custom alias, expiry, stats
│   ├── App.css                  # Global styles (forms, badges, tables, responsive)
│   ├── index.css                # Base font/imports
│   └── (other components and styles as needed)
```

---

## Key Files & State

- **src/App.jsx**
  - **State**
    - `urls` (history): array of short/long URL records
    - `batchInput`: input for batch shortening
    - `customAlias` for optional user-defined alias
    - `expiryMinutes` (minutes): optional validity period
  - **Actions**
    - Single shorten (validates URL, optional custom alias)
    - Batch shorten (up to 5 URLs, shared validity)
    - Copy to clipboard
    - Open original (blocked if expired)
    - Clear history
  - **Views**
    - **Home**: forms, results, recent list
    - **Statistics**: totals, table with clicks, type, expiry

- **src/App.css**
  - Styles for:
    - Forms, buttons, table layout, badges
    - Batch UI: `.batch-container`, batch inputs
    - Expiry badges: `.valid-badge`, `.expired-badge`

---

## Usage

### Home

- **Single Shorten**  
  - Paste the URL
  - Optionally enable “Use custom URL” to provide a custom alias
  - Submit
- **Batch Shorten**  
  - Paste up to 5 URLs (one per line)
  - Optional: enable “Set validity” (default 30 minutes)
  - Click “Shorten All”

### Results

- Short links appear with the original URL
- Actions per result:
  - Open original URL (blocked if expired)
  - Copy short URL to clipboard
  - History shows status and badges (valid/expired)

### Statistics

- **Totals**: Number of URLs, total clicks, number of custom aliases
- **Table**: Short, Original, Clicks, Created, Last Clicked, Type, Expiry

---

## Customization & Defaults

- **Default validity**: 30 minutes (configurable in App.jsx as `validityMinutes` state)
- **In-memory only**: Refresh clears state
- **Short links**: Simulated at `https://short.ly/{code}` and handled client-side
- **Expiry**: Checked before opening the original URL. Expired links are blocked.

---

## Scripts (development & build)

From the project root, navigate to the frontend directory and run:

- Install
  ```
  cd frontend/Url-shortener
  npm install
  ```
- Development server
  ```
  npm run dev
  ```
  Open the printed local URL (e.g., http://localhost:5173).

- Production build
  ```
  npm run build
  ```
- Preview built app
  ```
  npm run preview
  ```
- Lint
  ```
  npm run lint
  ```

---

## Assumptions / Notes

- **No persistence or server redirects**: State is stored in memory for the session only.
- **Alias uniqueness**: Scoped to the current session history only.
- **Expiry behavior**: Expiry is evaluated when attempting to open the original URL.

---

