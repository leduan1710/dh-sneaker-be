import BaseRepository from './BaseRepository.js';

class OrderRepository extends BaseRepository {
    modelName = 'Orders';

    constructor() {
        super();
        this.db = this.prisma.orders;
        this.dbOrderDetail = this.prisma.orderDetail;
        this.defaultSelect = {
            id: true,
            address: true,
            paid: true,
            orderDetailIdList: true,
            customerName: true,
            customerPhone: true,
            priceShip: true,
            shipFee: true,
            userId: true,
            status: true,
            updateDate: true,
        };
    }

    async findOrderMany(req) {
        const orders = await this.db.findMany({
            where: {
                id: {
                    in: req.body.listOrderId,
                },
                userId: req.user.id,
            },
            orderBy: {
                updateDate: 'desc',
            },
            select: this.defaultSelect,
        });
        return orders;
    }
    async findOrderByShop(shopId) {
        const orders = await this.db.findMany({
            where: {
                shopId: shopId,
            },
            orderBy: {
                updateDate: 'desc',
            },
            select: this.defaultSelect,
        });
        return orders;
    }

    async getPriceOrder(orderId) {
        const order = await this.find(orderId);
        if (order) {
            const orderDetails = await this.dbOrderDetail.findMany({ where: { id: { in: order.orderDetailIdList } } });
            if (orderDetails.length > 0) {
                return orderDetails.reduce((accumulator, current) => {
                    if (current.discountPrice) {
                        return accumulator + (current.price - current.discountPrice) * current.quantity;
                    } else {
                        return accumulator + current.price * current.quantity;
                    }
                }, 0);
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
}

export default new OrderRepository();
