import OrderRepository from '../repositories/OrderRepository.js';

class OrderService {
    async getNewOrderByStep(take, step) {
        try {
            const orders = await OrderRepository.findNewOrderByShopByStep(take, step);
            return orders;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
    async getAllOrderByStep(take, step) {
        try {
            const orders = await OrderRepository.findAllOrderByShopByStep(take, step);
            return orders;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
    async confirmedOrder(orderId) {
        try {
            const order = await OrderRepository.find(orderId);

            if (order.status === 'PROCESSING') {
                // Cập nhật trạng thái đơn hàng
                const updatedOrder = await OrderRepository.update(orderId, {
                    status: 'SUCCESS',
                    updateDate: new Date(),
                });

                if (updatedOrder) {
                    return updatedOrder;
                } else {
                    return 'Fail';
                }
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }
    async cancelledOrder(orderId) {
        try {
            const order = await OrderRepository.find(orderId);

            const updatedOrder = await OrderRepository.update(orderId, {
                status: 'CANCEL',
                updateDate: new Date(),
            });

            if (updatedOrder) {
                return updatedOrder;
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }
}
export default new OrderService();
