import BaseRepository from './BaseRepository.js';

class MessageDetailRepository extends BaseRepository {
    modelName = 'MessageDetail';

    constructor() {
        super();
        this.db = this.prisma.messageDetail;
    }

    async findMessageDetailByMessageId(messageId) {
        await this.db.updateMany({
            where: { messageId: messageId, isUserSent: false },
            data: { status: 'read' },
        });

        const messageDetails = await this.db.findMany({
            where: { messageId: messageId },
            orderBy: {
                createDate: 'asc',
            },
        });
        return messageDetails;
    }

    async findMessageDetailByMessageIdByShop(messageId) {
        await this.db.updateMany({
            where: { messageId: messageId, isUserSent: true },
            data: { status: 'read' },
        });

        const messageDetails = await this.db.findMany({
            where: { messageId: messageId },
            orderBy: {
                createDate: 'asc',
            },
        });
        return messageDetails;
    }
}

export default new MessageDetailRepository();
