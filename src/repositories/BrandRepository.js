import BaseRepository from './BaseRepository.js';

class BrandRepository extends BaseRepository {
    modelName = 'Brand';

    constructor() {
        super();
        this.db = this.prisma.brand;
    }
}

export default new BrandRepository();
