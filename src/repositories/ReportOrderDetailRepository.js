import BaseRepository from './BaseRepository.js';

class ReportOrderDetailRepository extends BaseRepository {
    modelName = 'ReportOrderDetail';

    constructor() {
        super();
        this.db = this.prisma.reportOrderDetail;
    }
}

export default new ReportOrderDetailRepository();
