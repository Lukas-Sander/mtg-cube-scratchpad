## Corrected Architecture

**BaseView = abstract class for all views**
**MainView = launcher that can be closed**

```javascript
// BaseView.js
class BaseView {
    constructor() {
        this.container = document.getElementById('app');
        this.changeBus = window.changeBus;
        this.setupChangeBusListeners();
    }

    setupChangeBusListeners() {
        // Override in child classes to listen for specific events
    }

    render() {
        throw new Error('render() must be implemented by child class');
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
```

```javascript
// MainView.js (launcher only)
class MainView extends BaseView {
    render() {
        this.container.innerHTML = `
            <div class="launcher">
                <h1>MTG Cube Scratchpad</h1>
                <p>Select a view to open:</p>
                <nav class="launcher-nav">
                    <button data-view="cube" data-width="1200" data-height="800">Cube Builder</button>
                    <button data-view="search" data-width="900" data-height="700">Card Search</button>
                    <button data-view="import" data-width="800" data-height="600">Import Data</button>
                    <button data-view="settings" data-width="600" data-height="500">Settings</button>
                </nav>
                <p class="launcher-hint">You can close this window after opening views.</p>
            </div>
        `;
        
        this.setupViewButtons();
    }

    setupViewButtons() {
        const buttons = this.container.querySelectorAll('button[data-view]');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const viewName = btn.dataset.view;
                const width = parseInt(btn.dataset.width) || 800;
                const height = parseInt(btn.dataset.height) || 600;
                
                this.openView(viewName, width, height);
            });
        });
    }

    openView(viewName, width, height) {
        const url = `index.html?view=${viewName}`;
        
        // Center the window on screen
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
        
        window.open(url, `mtg_${viewName}_${Date.now()}`, features);
    }

    setupChangeBusListeners() {
        // Main view doesn't need to listen to changes
    }
}
```

```javascript
// CubeView.js (minimal mock)
class CubeView extends BaseView {
    constructor() {
        super();
        this.cubeCards = [];
    }

    render() {
        this.container.innerHTML = `
            <div class="cube-view">
                <header>
                    <h1>Cube Builder</h1>
                    <div class="cube-stats">
                        <span>Cards: <span id="cubeCount">0</span></span>
                    </div>
                </header>
                <main>
                    <div id="cubeContent">
                        <!-- Cube content will go here -->
                        <p>Cube builder view - coming soon</p>
                    </div>
                </main>
            </div>
        `;
        
        this.loadCubeData();
    }

    async loadCubeData() {
        // TODO: Load cube from database
        console.log('Loading cube data...');
    }

    setupChangeBusListeners() {
        // Listen for card imports, cube updates, etc.
        this.changeBus.on('cards_imported', () => {
            console.log('Cards imported, refresh available');
        });
    }
}
```

```javascript
// SearchView.js (minimal mock)
class SearchView extends BaseView {
    render() {
        this.container.innerHTML = `
            <div class="search-view">
                <header>
                    <h1>Card Search</h1>
                </header>
                <main>
                    <div class="search-container">
                        <input type="text" id="searchInput" placeholder="Search for cards..." />
                        <div id="searchResults"></div>
                        <div id="cardDisplay"></div>
                    </div>
                </main>
            </div>
        `;
        
        this.setupSearch();
    }

    setupSearch() {
        // TODO: Initialize search functionality
        console.log('Search view ready');
    }

    setupChangeBusListeners() {
        this.changeBus.on('cards_imported', () => {
            console.log('Cards imported, search index may need refresh');
        });
    }
}
```

```javascript
// ImportView.js (minimal mock)
class ImportView extends BaseView {
    render() {
        this.container.innerHTML = `
            <div class="import-view">
                <header>
                    <h1>Import Data</h1>
                </header>
                <main>
                    <div class="import-container">
                        <button id="importBtn">Import Card Data</button>
                        <button id="downloadImagesBtn">Download Images</button>
                        <div id="importProgress" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
        
        this.setupImportButtons();
    }

    setupImportButtons() {
        const importBtn = document.getElementById('importBtn');
        const downloadBtn = document.getElementById('downloadImagesBtn');
        
        importBtn.addEventListener('click', () => this.startImport());
        downloadBtn.addEventListener('click', () => this.startImageDownload());
    }

    async startImport() {
        console.log('Starting import...');
        // TODO: Move import logic from main.js here
        
        try {
            const result = await importController.importBulkData((progress) => {
                console.log(progress);
            });
            
            // Notify other views
            this.changeBus.emit('cards_imported', { count: result.cardCount });
            
            alert('Import successful!');
        } catch (error) {
            alert('Import failed: ' + error.message);
        }
    }

    async startImageDownload() {
        console.log('Starting image download...');
        // TODO: Implement
    }

    setupChangeBusListeners() {
        // Import view might not need to listen to anything
    }
}
```

```javascript
// SettingsView.js (minimal mock)
class SettingsView extends BaseView {
    render() {
        this.container.innerHTML = `
            <div class="settings-view">
                <header>
                    <h1>Settings</h1>
                </header>
                <main>
                    <div class="settings-container">
                        <h2>Database</h2>
                        <p>Card count: <span id="cardCount">Loading...</span></p>
                        <button id="clearDbBtn">Clear Database</button>
                        
                        <h2>Preferences</h2>
                        <p>Settings coming soon...</p>
                    </div>
                </main>
            </div>
        `;
        
        this.loadSettings();
    }

    async loadSettings() {
        const count = await databaseController.getCardCount();
        document.getElementById('cardCount').textContent = count;
        
        document.getElementById('clearDbBtn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all cards?')) {
                await databaseController.clearCards();
                this.changeBus.emit('database_cleared');
                this.loadSettings();
            }
        });
    }

    setupChangeBusListeners() {
        this.changeBus.on('cards_imported', () => {
            this.loadSettings(); // Refresh card count
        });
        
        this.changeBus.on('database_cleared', () => {
            this.loadSettings();
        });
    }
}
```

```javascript
// viewLoader.js
class ViewLoader {
    constructor() {
        this.currentView = null;
        this.loadViewFromURL();
    }

    loadViewFromURL() {
        const params = new URLSearchParams(window.location.search);
        const viewName = params.get('view') || 'main';
        this.loadView(viewName);
    }

    loadView(viewName) {
        if (this.currentView && this.currentView.destroy) {
            this.currentView.destroy();
        }

        switch(viewName) {
            case 'cube':
                this.currentView = new CubeView();
                break;
            case 'search':
                this.currentView = new SearchView();
                break;
            case 'import':
                this.currentView = new ImportView();
                break;
            case 'settings':
                this.currentView = new SettingsView();
                break;
            case 'main':
            default:
                this.currentView = new MainView();
                break;
        }

        this.currentView.render();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.viewLoader = new ViewLoader();
    });
} else {
    window.viewLoader = new ViewLoader();
}
```

## Updated HTML Head

```html
<!--  different view classes  -->
<script defer src="js/view/BaseView.js" type="application/javascript"></script>
<script defer src="js/view/MainView.js" type="application/javascript"></script>
<script defer src="js/view/CubeView.js" type="application/javascript"></script>
<script defer src="js/view/SearchView.js" type="application/javascript"></script>
<script defer src="js/view/ImportView.js" type="application/javascript"></script>
<script defer src="js/view/SettingsView.js" type="application/javascript"></script>

<!--  global scripts  -->
<script defer src="js/changeBus.js" type="application/javascript"></script>
<script defer src="js/viewLoader.js" type="application/javascript"></script>
```

## Workflow

**User opens `index.html`:**
1. MainView renders with launcher buttons
2. User clicks "Cube Builder"
3. New window opens with `index.html?view=cube`
4. CubeView renders in new window
5. User can close main launcher window
6. Cube window continues working independently

**Does this match your vision?**