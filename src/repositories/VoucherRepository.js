import BaseRepository from './BaseRepository.js';

class VoucherRepository extends BaseRepository {
    modelName = 'Voucher';

    constructor() {
        super();
        this.db = this.prisma.voucher;
    }
    async deleteVoucherMany(voucherIds) {
        const result = await this.db.deleteMany({
            where: {
                id: {
                    in: voucherIds,
                },
            },
        });
        return result;
    }
}

export default new VoucherRepository();
