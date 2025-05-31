import BaseRepository from './BaseRepository.js';

class AnnoucementRepository extends BaseRepository {
    modelName = 'Annoucement';

    constructor() {
        super();
        this.db = this.prisma.announcement;
    }
}

export default new AnnoucementRepository();
