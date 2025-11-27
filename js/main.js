

let params = new URLSearchParams(document.location.search);
const view = params.get('view');    //this defines what this window looks at: main, cube, collection etc.

//TODO: inspect AI code
const importBtn = document.getElementById('importBtn');
const downloadImagesBtn = document.getElementById('downloadImagesBtn');
const importProgress = document.getElementById('importProgress');
const imageProgress = document.getElementById('imageProgress');

importBtn.addEventListener('click', async () => {
    importBtn.disabled = true;
    downloadImagesBtn.disabled = true;
    importProgress.style.display = 'block';

    try {
        await importController.importBulkData((progress) => {
            updateProgress('import', progress);
        });

        alert('Card data imported successfully!');

        const cardCount = await databaseController.getCardCount();
        console.log(`Total cards in database: ${cardCount}`);

    } catch (error) {
        alert('Import failed: ' + error.message);
    } finally {
        importBtn.disabled = false;
        downloadImagesBtn.disabled = false;
        setTimeout(() => {
            importProgress.style.display = 'none';
        }, 2000);
    }
});

downloadImagesBtn.addEventListener('click', async () => {
    importBtn.disabled = true;
    downloadImagesBtn.disabled = true;
    imageProgress.style.display = 'block';

    try {
        const result = await importController.downloadAllImages((progress) => {
            updateProgress('image', progress);
        });

        alert(`Downloaded ${result.downloadedCount} of ${result.total} images!`);

    } catch (error) {
        alert('Image download failed: ' + error.message);
    } finally {
        importBtn.disabled = false;
        downloadImagesBtn.disabled = false;
        setTimeout(() => {
            imageProgress.style.display = 'none';
        }, 2000);
    }
});

function updateProgress(type, progress) {
    const prefix = type === 'import' ? 'import' : 'image';
    const fillElement = document.getElementById(`${prefix}ProgressFill`);
    const percentElement = document.getElementById(`${prefix}ProgressPercent`);
    const textElement = document.getElementById(`${prefix}ProgressText`);

    let stageText = '';
    let percentage = 0;

    switch (progress.stage) {
        case 'fetching_metadata':
            stageText = 'Fetching bulk data information...';
            break;
        case 'downloading_data':
            stageText = 'Downloading card data...';
            break;
        case 'clearing_database':
            stageText = 'Clearing existing data...';
            break;
        case 'importing_cards':
            percentage = Math.round((progress.current / progress.total) * 100);
            stageText = `Importing cards: ${progress.current} / ${progress.total}`;
            break;
        case 'downloading_images':
            percentage = Math.round((progress.current / progress.total) * 100);
            stageText = `Downloading images: ${progress.current} / ${progress.total}`;
            break;
    }

    fillElement.style.width = percentage + '%';
    percentElement.textContent = percentage + '%';
    textElement.textContent = stageText;
}

document.addEventListener("DOMContentLoaded", () => {
    async function renderForest() {
        const card = await databaseController.getCardByName('Forest');

        if (card && card.imageBlob) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(card.imageBlob);
            img.onload = () => URL.revokeObjectURL(img.src);
            document.body.appendChild(img);
        }
    }

    renderForest();

});