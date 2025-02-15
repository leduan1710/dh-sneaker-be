import BaseRepository from './BaseRepository.js';

class ShopRepository extends BaseRepository {
    modelName = 'Shop';

    constructor() {
        super();
        this.db = this.prisma.shop;
    }
    findByName(name) {
        return this.db.findUnique({
            where: { name: name },
        });
    }
    findByUserId(userId) {
        return this.db.findMany({
            where: { userId: userId },
        });
    }
}

export default new ShopRepository();
