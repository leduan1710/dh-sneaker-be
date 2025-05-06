import { ReqNotification } from '../controllers/socket/EmitSocket.js';
import CommissionRepository from '../repositories/CommissionRepository.js';
import OrderDetailRepository from '../repositories/OrderDetailRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import UserRepository from '../repositories/UserRepository.js';

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
            const orders = await OrderRepository.findAllOrderByStep(take, step);
            return orders;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
    async getAllOrderByCTVName(ctvName) {
        try {
            const orders = await OrderRepository.findAllOrderByCTVName(ctvName);
            return orders;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
    async getAllOrderByCTV(userId, month, year) {
        try {
            const orders = await OrderRepository.findAllOrderByCTV(userId. month, year);
            return orders;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
    async confirmedOrder(orderId) {
        try {
            const order = await OrderRepository.find(orderId);
            const orderDetails = await OrderDetailRepository.db.findMany({
                where: {
                    orderId: order.id,
                },
            });
            const commission =
                order.CODPrice -
                order.shipFee -
                orderDetails.reduce((total, detail) => {
                    return total + detail.ctvPrice * detail.quantity;
                }, 0);

            if (order.status === 'PROCESSING') {
                // Cập nhật trạng thái đơn hàng
                const updatedOrder = await OrderRepository.update(orderId, {
                    status: 'SUCCESS',
                    updateDate: new Date(),
                    commission: commission,
                });

                if (updatedOrder) {
                    const currentDate = new Date();
                    const month = currentDate.getMonth() + 1;
                    const year = currentDate.getFullYear();

                    let commissionRecord = await CommissionRepository.db.findFirst({
                        where: {
                            userId: order.userId,
                            month: month,
                            year: year,
                        },
                    });

                    if (!commissionRecord) {
                        commissionRecord = await CommissionRepository.db.create({
                            data: {
                                userId: order.userId,
                                ctvName: order.ctvName,
                                commission: commission,
                                bonus: 0,
                                total: commission,
                                month: month,
                                year: year,
                            },
                        });
                    } else {
                        commissionRecord = await CommissionRepository.update({
                            where: { id: commissionRecord.id },
                            data: {
                                commission: commissionRecord.commission + commission,
                                total: commissionRecord.total + commission,
                            },
                        });
                    }
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
    async boomedOrder(orderId) {
        try {
            const order = await OrderRepository.find(orderId);

            if (order) {
                // Cập nhật trạng thái đơn hàng
                const updatedOrder = await OrderRepository.update(orderId, {
                    status: 'BOOM',
                    updateDate: new Date(),
                    commission: -60000,
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
    async cancelledOrder(orderId, cancelReason) {
        try {
            const order = await OrderRepository.find(orderId);
            const user = await UserRepository.find(order.userId)
            const updatedOrder = await OrderRepository.update(orderId, {
                status: 'CANCEL',
                updateDate: new Date(),
                commission: 0,
                orderDescribe: cancelReason,
            });

            if (updatedOrder) {
                const notification = await NotificationRepository.db.create({
                    data: {
                        describe: `Đơn hàng đã bị từ chối, mã đơn ${updatedOrder.id}`,
                        image: 'CancelOrder',
                        link: `/orders/cancel`,
                        userId: user.id,
                    },
                });
                if (notification) {
                    await UserRepository.update(user.id, {
                        notificationIdList: [...user.notificationIdList, notification.id],
                    });
                    ReqNotification(user.id);
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
}
export default new OrderService();
