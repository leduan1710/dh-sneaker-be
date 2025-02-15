import BaseRepository from './BaseRepository.js';

class ReportProductRepository extends BaseRepository {
    modelName = 'ReportProduct';

    constructor() {
        super();
        this.db = this.prisma.reportProduct;
    }
}

export default new ReportProductRepository();
