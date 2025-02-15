import BaseRepository from './BaseRepository.js';

class ReviewRepository extends BaseRepository {
    modelName = 'Review';

    constructor() {
        super();
        this.db = this.prisma.review;
    }
    async findByProductId(productId, take, skip) {
        return this.db.findMany({
            where: {
                productId: productId,
            },
            orderBy: {},
            take: take,
            skip: skip * take,
        });
    }

    async findAverageReviewByProduct(productId) {
        const reviews = await this.db.findMany({
            where: {
                productId: productId,
            },
        });
        if (reviews) {
            if (reviews.length > 0) {
                const averageReview = reviews.reduce((sum, obj) => sum + obj.rate, 0) / reviews.length;
            
                return averageReview;
            } else {
                return 0;
            }
        } else {
            return null;
        }
    }
}

export default new ReviewRepository();
