import ProductRepository from '../../repositories/ProductRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import AddressRepository from '../../repositories/AddressRepository.js';
import OrderDetailRepository from '../../repositories/OrderDetailRepository.js';
import OrderRepository from '../../repositories/OrderRepository.js';
import fs from 'fs';
import md5 from 'md5';
import NotificationRepository from '../../repositories/NotificationRepository.js';
import { socketIo } from '../../index.js';
import { ReqMessageNew, ReqNotification } from '../../controllers/socket/EmitSocket.js';
import path from 'path';
import ProductDetailRepository from '../../repositories/ProductDetailRepository.js';

class UserService {
    /////////////////////////
    userDAO = (user) => {
        return {
            id: user.id,
            phone: user.phone,
            name: user.name,
            image: user.image,
            email: user.email,
            sex: user.sex,
            birthDay: user.birthDay,
            role: user.role,
            defaultAddressId: user.defaultAddressId,
            rank: user.rank,
            point: user.point,
            addressIdList: user.addressIdList,
            orderIdList: user.orderIdList,
            reviewIdList: user.reviewIdList,
            shopFollowIdList: user.shopFollowIdList,
            productFavoriteIdList: user.productFavoriteIdList,
            notificationIdList: user.notificationIdList,
            orderDetailReportIdList: user.orderDetailReportIdList,
            shopReportIdList: user.shopReportIdList,
            productReportIdList: user.productReportIdList,
            voucherIdList: user.voucherIdList,
            voucherUsedIdList: user.voucherUsedIdList,
            shopId: user.shopId,
            walletId: user.walletId,
            active: user.active,
        };
    };
    shopDAO = (shop) => {
        return {
            id: shop.id,
            name: shop.name,
            image: shop.image,
            describeShop: shop.describeShop,
            addressShop: shop.addressShop,
            phoneShop: shop.phoneShop,
            createDate: shop.createDate,
            userFollowIdList: shop.userFollowIdList,
            productIdList: shop.productIdList,
            orderIdList: shop.orderIdList,
            bannerIdList: shop.bannerIdList,
            discountIdList: shop.discountIdList,
            voucherIdList: shop.voucherIdList,
            userId: shop.userId,
            active: shop.active,
        };
    };
    //////////////////////////
    async changePassword(req) {
        try {
            if (req.user.password == md5(req.body.passwordOld)) {
                return 'Let sent otp';
            } else {
                return 'Incorrect password';
            }
        } catch {
            return 'Fail';
        }
    }
    async changePassword_2fa(req) {
        try {
            const user = await UserRepository.findByEmail(req.user.email);
            if (user.codeExpiry > new Date().getTime()) {
                if (req.body.code == String(user.code)) {
                    const resUpdate = await UserRepository.update(req.user.id, {
                        password: md5(req.body.passwordNew),
                        codeExpiry: new Date(),
                    });
                    if (resUpdate) {
                        return this.userDAO(resUpdate);
                    } else {
                        return 'Fail';
                    }
                }
            } else {
                return 'Code expiry';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }
    async getUser(email) {
        try {
            const user = await UserRepository.findByEmail(email);
            if (user) {
                return this.userDAO(user);
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }

    async getAllUsers() {
        try {
            const users = await UserRepository.findAll();
            if (users) {
                return users;
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }
    async getCTVNameList() {
        try {
            const users = await UserRepository.db.findMany({
                where: {
                    role: 'CTV',
                },
                select: {
                    name: true
                }
            });
            if (users) {
                return users;
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }

    async updateUserInfo(req) {
        try {
            const new_user = await UserRepository.update(req.user.id, req.body);
            return this.userDAO(new_user);
        } catch {
            return 'Fail';
        }
    }

    async deleteAddress(req, addressId) {
        try {
            await AddressRepository.delete(addressId);
            if (req.user.defaultAddressId == addressId) {
                const addressIdList_new = req.user.addressIdList.filter((item) => item !== addressId);
                if (addressIdList_new.length > 0) {
                    const user = await UserRepository.update(req.user.id, {
                        addressIdList: addressIdList_new,
                        defaultAddressId: addressIdList_new[0],
                    });
                    if (user) return user;
                } else {
                    const user = await UserRepository.update(req.user.id, {
                        addressIdList: [],
                        defaultAddressId: null,
                    });
                    if (user) return user;
                }
            } else {
                const addressIdList_new = req.user.addressIdList.filter((item) => item !== addressId);
                const user = await UserRepository.update(req.user.id, { addressIdList: addressIdList_new });
                if (user) return user;
            }
        } catch {
            return 'Fail';
        }
    }

    async handleOrder(orderData) {
        try {
            const { listOrderDetail, ...order } = orderData;
            const user = await UserRepository.find(order.userId);
            const admin = await UserRepository.db.findFirst({where: {
                role: "ADMIN"
            }})
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            const orderCountInMonth = await OrderRepository.db.count({
                where: {
                    userId: order.userId,
                    createDate: {
                        gte: startOfMonth,
                    },
                },
            });

            const lastName = order.ctvName.split(' ').pop();
            const orderCode = `${lastName}_T${month}_${year}_${orderCountInMonth + 1}`;
            if (listOrderDetail.length > 0) {
                order.status = 'PROCESSING';
                order.orderCode = orderCode;
                const orderRes = await OrderRepository.db.create({ data: order });

                if (orderRes) {
                    //
                    const orderIdList_new = [...user.orderIdList, orderRes.id];
                    await UserRepository.update(user.id, { orderIdList: orderIdList_new });
                    //
                    const listOrderDetailId = await Promise.all(
                        listOrderDetail.map(async (orderDetail) => {
                            orderDetail.orderId = orderRes.id;
                            const productDetail = await ProductDetailRepository.find(orderDetail.productDetailId);
                            if (!productDetail) {
                                return 'Fail';
                            }
                            if (productDetail.quantity < orderDetail.quantity) {
                                await OrderRepository.delete(orderRes.id);
                                return 'Fail';
                            }
                            await ProductDetailRepository.update(productDetail.id, {
                                quantity: productDetail.quantity - orderDetail.quantity,
                            });
                            const resOrderDetail = await OrderDetailRepository.db.create({ data: orderDetail });
                            if (resOrderDetail) {
                                return resOrderDetail.id;
                            }
                        }),
                    );
                    const filteredOrderDetailId = listOrderDetailId.filter((id) => id !== null);
                    const orderRes_2 = await OrderRepository.update(orderRes.id, {
                        orderDetailIdList: filteredOrderDetailId,
                    });
                    if (orderRes_2) {
                        const notification = await NotificationRepository.db.create({
                            data: {
                                describe: `Có đơn hàng mới`,
                                image: 'NewOrder',
                                link: `/orders/processing`,
                                userId: admin.id,
                            },
                        });
                        if (notification) {
                            await UserRepository.update(admin.id, {
                                notificationIdList: [...admin.notificationIdList, notification.id],
                            });
                            ReqNotification(admin.id);
                            return orderRes_2;
                        } else {
                            return 'Fail';
                        }
                    } else {
                        return 'Fail';
                    }
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

    async cancleOrder(orderId, req) {
        try {
            const order = await OrderRepository.find(orderId);
            if (order.coolDown) {
                const currentDate = new Date();
                if (currentDate - order.updateDate < order.coolDown) {
                    return 'More require';
                }
            }
            if (order.voucherId) {
                const voucher = await VoucherRepository.find(order.voucherId);
                await VoucherRepository.update(voucher.id, { quantity: voucher.quantity + 1 });
                const new_voucherUsedIdList = req.user.voucherUsedIdList.filter((item) => item !== voucher.id);
                await UserRepository.update(req.user.id, { voucherUsedIdList: new_voucherUsedIdList });
            }
            if ((order.status == 'PROCESSING' || order.status == 'CONFIRMED') && order.userId == req.user.id) {
                const order_new = await OrderRepository.update(orderId, {
                    status: 'CANCEL',
                    updateDate: new Date(),
                    coolDown: 24 * 60 * 60 * 1000,
                });
                if (order_new) {
                    //increase quantity product detail
                    const orderDetails = await OrderDetailRepository.db.findMany({ where: { orderId: order_new.id } });
                    for (const index in orderDetails) {
                        await ProductDetailRepository.db.update({
                            where: { id: orderDetails[index].productDetailId },
                            data: { quantity: { increment: orderDetails[index].quantity } },
                        });
                    }
                    //
                    const notification = await NotificationRepository.db.create({
                        data: {
                            describe: `Hủy đơn hàng thành công, đơn hàng ${orderId}, kiểm tra lại giỏ hàng !`,
                            image: 'CancleOrderSuccess',
                            link: '/user/order/cancle',
                            userId: req.user.id,
                        },
                    });
                    if (notification) {
                        await UserRepository.update(req.user.id, {
                            notificationIdList: [...req.user.notificationIdList, notification.id],
                        });
                        ReqNotification(req.user.id);

                        return order_new;
                    } else {
                        return 'Fail';
                    }
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
    async reOrder(orderId, req) {
        try {
            const order = await OrderRepository.find(orderId);
            if (order.coolDown) {
                const currentDate = new Date();
                if (currentDate - order.updateDate < order.coolDown) {
                    return 'More require';
                }
            }
            //
            const orderDetails = await OrderDetailRepository.db.findMany({ where: { orderId: order.id } });
            //check quantity
            for (const index in orderDetails) {
                const productDetail = await ProductDetailRepository.db.findFirst({
                    where: { id: orderDetails[index].productDetailId, active: true, activeByShop: true },
                });
                if (!productDetail) {
                    return 'Product not found';
                }
                if (productDetail.quantity < orderDetails[index].quantity) {
                    return 'Not enought quantity';
                }
            }
            //decrease quantity product detail
            for (const index in orderDetails) {
                await ProductDetailRepository.db.update({
                    where: { id: orderDetails[index].productDetailId },
                    data: { quantity: { decrement: orderDetails[index].quantity } },
                });
            }
            //
            if (order.voucherId) {
                const currentDate = new Date();
                const voucher = await VoucherRepository.db.findFirst({
                    where: { id: order.voucherId, expired: { gte: currentDate } },
                });
                if (!voucher) {
                    ('Voucher not found');
                }
                if (req.user.voucherUsedIdList.includes(voucher.id)) {
                    return 'Voucher used';
                }
                if (voucher.quantity == 0) {
                    return 'Voucher run out of';
                }
                await VoucherRepository.update(voucher.id, { quantity: voucher.quantity - 1 });
                await UserRepository.update(req.user.id, {
                    voucherUsedIdList: [...req.user.voucherUsedIdList, voucher.id],
                });
            }
            // const user = await UserRepository.find(req.user.id);
            await Promise.all(
                req.body.orderDetailIdList.map(async (orderDetailId) => {
                    const orderDetail = await OrderDetailRepository.find(orderDetailId);
                    const productDetail = await ProductDetailRepository.find(orderDetail.productDetailId);
                    if (!productDetail) {
                        return 'Fail';
                    }
                    if (productDetail.quantity < orderDetail.quantity) {
                        return 'Fail';
                    }
                    // await ProductDetailRepository.update(productDetail.id, {
                    //     quantity: productDetail.quantity - orderDetail.quantity,
                    // });
                }),
            );

            if (order.status == 'CANCEL' && order.userId == req.user.id) {
                const order_new = await OrderRepository.update(orderId, {
                    status: 'PROCESSING',
                    updateDate: new Date(),
                    coolDown: 24 * 60 * 60 * 1000,
                });
                if (order_new) {
                    const notification = await NotificationRepository.db.create({
                        data: {
                            describe: `Đặt lại hàng thành công, đơn hàng ${orderId}, kiểm tra lại giỏ hàng !`,
                            image: 'ReOrderSuccess',
                            link: '/user/order',
                            userId: req.user.id,
                        },
                    });
                    if (notification) {
                        await UserRepository.update(req.user.id, {
                            notificationIdList: [...req.user.notificationIdList, notification.id],
                        });
                        ReqNotification(req.user.id);
                        return order_new;
                    } else {
                        return 'Fail';
                    }
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

    async getNotificationByUser(userId) {
        try {
            const notifications = await NotificationRepository.getNotificationByUserisCTV(userId);
            if (notifications) {
                return notifications;
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }

    async handleReadNotification(notificationId) {
        try {
            const notification = await NotificationRepository.find(notificationId);
            if (notification) {
                const notification_new = await NotificationRepository.update(notificationId, { status: 'SEEN' });
                if (notification_new) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
}
export default new UserService();
