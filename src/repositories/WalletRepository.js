import BaseRepository from './BaseRepository.js';

class WalletRepository extends BaseRepository {
    modelName = 'Wallet';

    constructor() {
        super();
        this.db = this.prisma.wallet;
    }
}

export default new WalletRepository();
