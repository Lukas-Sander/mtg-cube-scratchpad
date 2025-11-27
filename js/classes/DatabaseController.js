
//TODO: inspect AI code
// DatabaseController.js
class DatabaseController {
    constructor() {
        this.db = new Dexie('MTGCubeDatabase');

        this.db.version(1).stores({
            cards: '++id, name, *colors, set, rarity, type_line',
            metadata: 'key'
        });

        this.initialize();
    }

    async initialize() {
        try {
            await this.db.open();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }

    getDatabase() {
        return this.db;
    }

    async clearCards() {
        await this.db.cards.clear();
    }

    async getCardCount() {
        return await this.db.cards.count();
    }

    async bulkAddCards(cards) {
        await this.db.cards.bulkAdd(cards);
    }

    async getCardByName(name) {
        return await this.db.cards.where('name').equals(name).first();
    }

    async updateCardImage(cardId, imageBlob) {
        await this.db.cards.update(cardId, { imageBlob: imageBlob });
    }

    async getMetadata(key) {
        const result = await this.db.metadata.get(key);
        return result ? result.value : null;
    }

    async setMetadata(key, value) {
        await this.db.metadata.put({ key: key, value: value });
    }

    async getCardsWithoutImages(limit = 100) {
        return await this.db.cards
            .filter(card => !card.imageBlob)
            .limit(limit)
            .toArray();
    }
}

// Create global instance
const databaseController = new DatabaseController();
