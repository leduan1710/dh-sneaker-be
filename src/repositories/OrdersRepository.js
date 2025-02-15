import BaseRepository from './BaseRepository.js';

class OrdersRepository extends BaseRepository {
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
            priceShip: true,
            shipId: true,
            userId: true,
            shopId: true,
            status: true,
            coolDown: true,
            updateDate: true,
            priceVoucher: true,
            priceMember: true,
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

export default new OrdersRepository();
