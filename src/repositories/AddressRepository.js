import BaseRepository from './BaseRepository.js';

class AddressRepository extends BaseRepository {
    modelName = 'Address';

    constructor() {
        super();
        this.db = this.prisma.address;
    }


}

export default new AddressRepository();
