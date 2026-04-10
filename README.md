# MyHours Chrome Extension

A Chrome extension that embeds the [MyHours](https://app.myhours.com) track page into Chrome's Side Panel, keeping it always visible alongside any page you browse.

## Installation

This extension is not published to the Chrome Web Store. Install it manually as an unpacked extension:

1. Download or clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the folder containing this repository.
6. The MyHours icon will appear in your Chrome toolbar.

To update after pulling new changes, go back to `chrome://extensions` and click the refresh icon on the extension card.

## Usage

Click the MyHours icon in the Chrome toolbar to open or close the Side Panel. The panel stays visible as you navigate between tabs and browser windows.

## What it contains

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV3). Declares permissions, side panel entry point, and content script. |
| `background.js` | Service worker. Registers the toolbar icon to toggle the side panel. |
| `app.html` | Side panel page. A full-size iframe pointing to `https://app.myhours.com`. |
| `content.js` | Injected into the MyHours iframe. Applies UI compacting: removes unused elements, removes the sidebar and style daily track to be more compact. |
| `rules.json` | Declarative network rules that strip `X-Frame-Options` and `Content-Security-Policy` headers from MyHours responses, allowing the site to load inside the iframe. |

## UI customizations applied by `content.js`

- Removes the sidebar, header, intercom widget, and other unused functionalities
- Compacts the tool bar below datepicker
- Restructures time inputs (duration, start, end) into a single row with a 1.5 : 1 : 1 width ratio
- On log list items: toolbar buttons are hidden by default and appear on hover, replacing the time display to save space
- Minimizes paddings and margins throughout the form and log list
- Custom background color on the log form and modal
- Removes unused form fields (billable amount, labor cost)
- Strips button labels from icon-only buttons

## Permissions used

- `sidePanel` — opens the Side Panel UI
- `declarativeNetRequest` — strips headers that would block iframe embedding
- `host_permissions: https://app.myhours.com/*` — scopes content script and network rules to the MyHours domain only
