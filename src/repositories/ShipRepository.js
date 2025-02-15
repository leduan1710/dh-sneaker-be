import BaseRepository from './BaseRepository.js';

class ShipRepository extends BaseRepository {
    modelName = 'Ship';

    constructor() {
        super();
        this.db = this.prisma.ship;
    }
}

export default new ShipRepository();
