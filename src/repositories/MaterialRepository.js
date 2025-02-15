import BaseRepository from './BaseRepository.js';

class MaterialRepository extends BaseRepository {
    modelName = 'Material';

    constructor() {
        super();
        this.db = this.prisma.material;
    }

}

export default new MaterialRepository();
