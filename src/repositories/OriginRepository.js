import BaseRepository from './BaseRepository.js';

class OriginRepository extends BaseRepository {
    modelName = 'Origin';

    constructor() {
        super();
        this.db = this.prisma.origin;
    }

}

export default new OriginRepository();
