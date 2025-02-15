import BaseRepository from './BaseRepository.js';
import UserRepository from './UserRepository.js';

class MessageRepository extends BaseRepository {
    modelName = 'Message';

    constructor() {
        super();
        this.db = this.prisma.message;
    }

    async getMessageUserToShop(req) {
        const messages = await this.db.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                updateDate: 'desc',
            },
        });
        return messages;
    }

    async getMessageShopToUser(req) {
        const messages = await this.db.findMany({
            where: {
                shopId: req.user.shopId,
            },
            orderBy: {
                updateDate: 'desc',
            },
        });
        return messages;
    }
}

export default new MessageRepository();
