
//TODO: inspect AI code

// ImportController.js
class ImportController {
    constructor() {
        this.isImporting = false;
        this.isDownloadingImages = false;
    }

    async importBulkData(onProgress = null) {
        if (this.isImporting) {
            throw new Error('Import already in progress');
        }

        this.isImporting = true;

        try {
            if (onProgress) onProgress({ stage: 'fetching_metadata', current: 0, total: 0 });

            const bulkDataResponse = await fetch('https://api.scryfall.com/bulk-data');
            const bulkDataList = await bulkDataResponse.json();

            const defaultCards = bulkDataList.data.find(item => item.type === 'default_cards');

            if (!defaultCards) {
                throw new Error('Default cards bulk data not found');
            }

            if (onProgress) onProgress({ stage: 'downloading_data', current: 0, total: 100 });

            const cardsResponse = await fetch(defaultCards.download_uri);
            const cardsData = await cardsResponse.json();

            if (onProgress) onProgress({ stage: 'clearing_database', current: 0, total: 0 });
            await databaseController.clearCards();

            const totalCards = cardsData.length;
            const chunkSize = 1000;
            let processedCards = 0;

            for (let i = 0; i < cardsData.length; i += chunkSize) {
                const chunk = cardsData.slice(i, i + chunkSize);
                const processedChunk = chunk.map(card => this.processCard(card));

                await databaseController.bulkAddCards(processedChunk);

                processedCards += chunk.length;

                if (onProgress) {
                    onProgress({
                        stage: 'importing_cards',
                        current: processedCards,
                        total: totalCards
                    });
                }
            }

            await databaseController.setMetadata('last_import', new Date().toISOString());

            return { success: true, cardCount: totalCards };

        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        } finally {
            this.isImporting = false;
        }
    }

    processCard(card) {
        return {
            name: card.name || null,
            colors: card.colors || [],
            mana_cost: card.mana_cost || null,
            type_line: card.type_line || null,
            oracle_text: card.oracle_text || null,
            set: card.set || null,
            rarity: card.rarity || null,
            power: card.power || null,
            toughness: card.toughness || null,
            image_uri: card.image_uris?.small || null,
            imageBlob: null,
            scryfall_id: card.id || null
        };
    }

    async downloadAllImages(onProgress = null) {
        if (this.isDownloadingImages) {
            throw new Error('Image download already in progress');
        }

        this.isDownloadingImages = true;

        try {
            const cardsWithoutImages = await databaseController.getDatabase().cards
                .filter(card => card.image_uri && !card.imageBlob)
                .toArray();

            const totalImages = cardsWithoutImages.length;
            let downloadedCount = 0;

            if (onProgress) {
                onProgress({
                    stage: 'downloading_images',
                    current: 0,
                    total: totalImages
                });
            }

            for (const card of cardsWithoutImages) {
                try {
                    const imageResponse = await fetch(card.image_uri);
                    const imageBlob = await imageResponse.blob();

                    await databaseController.updateCardImage(card.id, imageBlob);

                    downloadedCount++;

                    if (onProgress) {
                        onProgress({
                            stage: 'downloading_images',
                            current: downloadedCount,
                            total: totalImages
                        });
                    }

                    await this.sleep(100);

                } catch (imageError) {
                    console.error(`Failed to download image for ${card.name}:`, imageError);
                }
            }

            await databaseController.setMetadata('last_image_download', new Date().toISOString());

            return { success: true, downloadedCount: downloadedCount, total: totalImages };

        } catch (error) {
            console.error('Image download failed:', error);
            throw error;
        } finally {
            this.isDownloadingImages = false;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isImportInProgress() {
        return this.isImporting;
    }

    isImageDownloadInProgress() {
        return this.isDownloadingImages;
    }
}

// Create global instance
const importController = new ImportController();
