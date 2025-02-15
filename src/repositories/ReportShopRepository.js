import BaseRepository from './BaseRepository.js';

class ReportShopRepository extends BaseRepository {
    modelName = 'ReportShop';

    constructor() {
        super();
        this.db = this.prisma.reportShop;
    }
}

export default new ReportShopRepository();
