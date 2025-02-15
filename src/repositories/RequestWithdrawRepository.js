import BaseRepository from './BaseRepository.js';

class RequestWithdrawRepository extends BaseRepository {
    modelName = 'RequestWithdraw';

    constructor() {
        super();
        this.db = this.prisma.requestWithdraw;
    }
}

export default new RequestWithdrawRepository();
