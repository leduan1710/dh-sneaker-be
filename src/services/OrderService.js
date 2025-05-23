import axios from 'axios';
import { ReqNotification } from '../controllers/socket/EmitSocket.js';
import CommissionRepository from '../repositories/CommissionRepository.js';
import NotificationRepository from '../repositories/NotificationRepository.js';
import OrderDetailRepository from '../repositories/OrderDetailRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import UserRepository from '../repositories/UserRepository.js';

class OrderService {
    async saveOrder(req) {
        try {
            const order = await OrderRepository.saveUpload(req);
            return order;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
    async getOrderById(orderId) {
        try {
            const order = await OrderRepository.find(orderId);
            return order;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
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

    async getOrderByPhoneOrDeliveringCode(searchTerm) {
        try {
            const order = await OrderRepository.db.findMany({
                where: {
                    OR: [
                        { deliveryCode: { contains: searchTerm, mode: 'insensitive' } },
                        { customerPhone: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
            });
            if (order) {
                return order;
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }

    async getAllOrderThisMonth() {
        try {
            const orders = await OrderRepository.findAllOrderThisMonth();
            return orders;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }

    async getAllOrderByCTV(userId, month, year) {
        try {
            const orders = await OrderRepository.findAllOrderByCTV(userId, month, year);
            return orders;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }

    async getRevenueAndCommissionByMonth(month, year) {
        try {
            const revenueAndCommission = await OrderRepository.getRevenueAndCommissionByMonth(month, year);
            return revenueAndCommission;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }

    async getOrderCountByMonth(month, year) {
        try {
            const orderCounts = await OrderRepository.orderCountByMonth(month, year);
            return orderCounts;
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
                    const month = updatedOrder.createDate.getMonth() + 1;
                    const year = updatedOrder.createDate.getFullYear();

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
                        commissionRecord = await CommissionRepository.db.update({
                            where: {
                                id: commissionRecord.id,
                            },
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
            const commission = -60000;
            if (order) {
                // Cập nhật trạng thái đơn hàng
                const updatedOrder = await OrderRepository.update(orderId, {
                    status: 'BOOM',
                    updateDate: new Date(),
                    commission: -60000,
                });

                if (updatedOrder) {
                    const month = updatedOrder.createDate.getMonth() + 1;
                    const year = updatedOrder.createDate.getFullYear();

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
                        commissionRecord = await CommissionRepository.db.update({
                            where: {
                                id: commissionRecord.id,
                            },
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
    async succeedOrder(orderId) {
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
            let commissionBoom = 0;
            if (order) {
                if (order.status === 'BOOM') commissionBoom = 60000;
                // Cập nhật trạng thái đơn hàng
                const updatedOrder = await OrderRepository.update(orderId, {
                    status: 'SUCCESS',
                    updateDate: new Date(),
                    commission: commission,
                });

                if (updatedOrder) {
                    const month = updatedOrder.createDate.getMonth() + 1;
                    const year = updatedOrder.createDate.getFullYear();

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
                        commissionRecord = await CommissionRepository.db.update({
                            where: {
                                id: commissionRecord.id,
                            },
                            data: {
                                commission: commissionRecord.commission + commission + commissionBoom,
                                total: commissionRecord.total + commission + commissionBoom,
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
    async cancelledOrder(orderId, cancelReason) {
        try {
            const order = await OrderRepository.find(orderId);
            const user = await UserRepository.find(order.userId);
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
            const isSuccessOrder = order.status === 'SUCCESS';
            if (order) {
                const updatedOrder = await OrderRepository.update(orderId, {
                    status: 'CANCEL',
                    updateDate: new Date(),
                    commission: 0,
                    orderDescribe: cancelReason,
                });

                if (updatedOrder) {
                    if (isSuccessOrder) {
                        const month = updatedOrder.createDate.getMonth() + 1;
                        const year = updatedOrder.createDate.getFullYear();

                        let commissionRecord = await CommissionRepository.db.findFirst({
                            where: {
                                userId: order.userId,
                                month: month,
                                year: year,
                            },
                        });

                        if (commissionRecord)  {
                            commissionRecord = await CommissionRepository.db.update({
                                where: {
                                    id: commissionRecord.id,
                                },
                                data: {
                                    commission: commissionRecord.commission - commission,
                                    total: commissionRecord.total - commission,
                                },
                            });
                        }
                    }
                    const notification = await NotificationRepository.db.create({
                        data: {
                            describe: `Đơn hàng đã bị hủy, mã đơn ${updatedOrder.id}`,
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
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }
    async createOrder(orderId, token) {
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
            if (order) {
                const orderData = {
                    GROUPADDRESS_ID: 22988657,
                    SENDER_FULLNAME: 'Duẫn Test',
                    SENDER_PHONE: '0773450028',
                    RECEIVER_FULLNAME: order.customerName,
                    RECEIVER_ADDRESS: order.addressDetail,
                    RECEIVER_PHONE: order.customerPhone,
                    PRODUCT_NAME: 'giày dép',
                    PRODUCT_QUANTITY: 1,
                    PRODUCT_PRICE: 999999,
                    PRODUCT_WEIGHT: 250,
                    PRODUCT_TYPE: 'HH',
                    ORDER_PAYMENT: 3,
                    ORDER_SERVICE: 'VSL7',
                    ORDER_SERVICE_ADD: '',
                    ORDER_NOTE:
                        'Cho kiểm hàng, không được thử hàng. Có vấn đề đơn hàng lên trạng thái giúp shop. KHÔNG TỰ Ý HOÀN HÀNG VÀ CHO KHÁCH THỬ HÀNG. ( ĐỀN 100%)',
                    MONEY_COLLECTION: order.CODPrice,
                };
                const response = await axios.post('https://partner.viettelpost.vn/v2/order/createOrder', orderData, {
                    headers: {
                        Token: token,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.data.message == 'OK') {
                    const updatedOrder = await OrderRepository.db.update({
                        where: {
                            id: order.id,
                        },
                        data: {
                            status: 'SUCCESS',
                            commission: commission,
                            deliveryCode: response.data.data.ORDER_NUMBER,
                        },
                    });
                    if (updatedOrder) {
                        const month = updatedOrder.createDate.getMonth() + 1;
                        const year = updatedOrder.createDate.getFullYear();

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
                            commissionRecord = await CommissionRepository.db.update({
                                where: {
                                    id: commissionRecord.id,
                                },
                                data: {
                                    commission: commissionRecord.commission + commission,
                                    total: commissionRecord.total + commission,
                                },
                            });
                        }
                    }
                    return { success: true, data: response.data };
                } else return { success: false };
            } else return { success: false };
        } catch (error) {
            console.error(error.message);
            return { success: false };
        }
    }

    async getAnnualRevenue(year) {
        try {
            const revenue = await OrderRepository.getAnnualRevenue(year);
            return revenue;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
}
export default new OrderService();
