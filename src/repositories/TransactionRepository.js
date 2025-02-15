import BaseRepository from './BaseRepository.js';

class TransactionRepository extends BaseRepository {
    modelName = 'Transaction';

    constructor() {
        super();
        this.db = this.prisma.transaction;
    }
}

export default new TransactionRepository();
