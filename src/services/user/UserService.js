import ProductRepository from '../../repositories/ProductRepository.js';
import ShopRepository from '../../repositories/ShopRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import AddressRepository from '../../repositories/AddressRepository.js';
import OrderDetailRepository from '../../repositories/OrderDetailRepository.js';
import OrdersRepository from '../../repositories/OrdersRepository.js';
import fs from 'fs';
import md5 from 'md5';
import NotificationRepository from '../../repositories/NotificationRepository.js';
import { socketIo } from '../../index.js';
import { ReqMessageNew, ReqNotification } from '../../controllers/socket/EmitSocket.js';
import ReviewRepository from '../../repositories/ReviewRepository.js';
import path from 'path';
import MessageRepository from '../../repositories/MessageRepository.js';
import MessageDetailRepository from '../../repositories/MessageDetailRepository.js';
import WalletRepository from '../../repositories/WalletRepository.js';
import TransactionRepository from '../../repositories/TransactionRepository.js';
import RequestWithdrawRepository from '../../repositories/RequestWithdrawRepository.js';
import ProductDetailRepository from '../../repositories/ProductDetailRepository.js';
import VoucherRepository from '../../repositories/VoucherRepository.js';

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

    async followShop(req, shopId) {
        try {
            const shop = await ShopRepository.find(shopId);
            if (shop && !shop.userFollowIdList.includes(req.user.id)) {
                const shop_new = await ShopRepository.update(shopId, {
                    userFollowIdList: [...shop.userFollowIdList, req.user.id],
                });
                const user_new = await UserRepository.update(req.user.id, {
                    shopFollowIdList: [...req.user.shopFollowIdList, shopId],
                });
                if (shop_new && user_new)
                    return {
                        user: this.userDAO(user_new),
                        shop: this.shopDAO(shop_new),
                    };
            } else {
                return 'Fail';
            }
        } catch (e) {
            return 'Fail';
        }
    }

    async unFollowShop(req, shopId) {
        try {
            const shop = await ShopRepository.find(shopId);
            if (shop && shop.userFollowIdList.includes(req.user.id)) {
                const new_list_shop = shop.userFollowIdList.filter((item) => item !== req.user.id);
                const shop_new = await ShopRepository.update(shopId, {
                    userFollowIdList: new_list_shop,
                });
                const new_list_user = req.user.shopFollowIdList.filter((item) => item !== shopId);
                const user_new = await UserRepository.update(req.user.id, {
                    shopFollowIdList: new_list_user,
                });
                if (shop_new && user_new)
                    return {
                        user: this.userDAO(user_new),
                        shop: this.shopDAO(shop_new),
                    };
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
    async favoriteProduct(req, productId) {
        try {
            const product = await ProductRepository.find(productId);
            if (product && !product.userFavoriteIdList.includes(req.user.id)) {
                const product_new = await ProductRepository.update(productId, {
                    userFavoriteIdList: [...product.userFavoriteIdList, req.user.id],
                });
                const user_new = await UserRepository.update(req.user.id, {
                    productFavoriteIdList: [...req.user.productFavoriteIdList, productId],
                });
                if (product_new && user_new)
                    return {
                        user: this.userDAO(user_new),
                    };
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }

    async unFavoriteProduct(req, productId) {
        try {
            const product = await ProductRepository.find(productId);
            if (product && product.userFavoriteIdList.includes(req.user.id)) {
                const new_list_product = product.userFavoriteIdList.filter((item) => item !== req.user.id);
                const product_new = await ProductRepository.update(productId, {
                    userFavoriteIdList: new_list_product,
                });
                const new_list_user = req.user.productFavoriteIdList.filter((item) => item !== productId);
                const user_new = await UserRepository.update(req.user.id, {
                    productFavoriteIdList: new_list_user,
                });
                if (product_new && user_new)
                    return {
                        user: this.userDAO(user_new),
                    };
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.log(e.message);
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

    async handleOrder(req) {
        try {
            const listOrderDetail = req.body.listOrderDetail;
            let order = req.body.order;
            const user = await UserRepository.find(req.user.id);
            const shop = await ShopRepository.find(order.shopId);
            const userShop = await UserRepository.find(shop.userId);
            if (listOrderDetail.length > 0) {
                order.userId = req.user.id;
                order.priceVoucher = parseFloat(req.body.order.priceVoucher);
                order.priceMember = parseFloat(req.body.order.priceMember);
                order.status = 'PROCESSING';
                const orderRes = await OrdersRepository.db.create({ data: order });
                if (orderRes && userShop) {
                    //
                    const notification = await NotificationRepository.db.create({
                        data: {
                            describe: `Có đơn hàng mới, mã đơn ${orderRes.id}`,
                            image: 'NewOrder',
                            link: `/shop/orders/processing`, // Link đến đơn hàng mới
                            userId: userShop.id,
                            isCTV: true,
                        },
                    });
                    if (notification) {
                        // Cập nhật danh sách thông báo của cửa hàng
                        await UserRepository.update(userShop.id, {
                            notificationIdList: [...userShop.notificationIdList, notification.id],
                        });

                        // Gửi thông báo đến cửa hàng
                        ReqNotification(userShop.id);
                    }
                }
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
                                await OrdersRepository.delete(orderRes.id);
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
                    const orderRes_2 = await OrdersRepository.update(orderRes.id, {
                        orderDetailIdList: filteredOrderDetailId,
                    });
                    if (orderRes_2) {
                        const notification = await NotificationRepository.db.create({
                            data: {
                                describe: `Đặt hàng thành công, đơn hàng ${orderRes.id}, kiểm tra lại giỏ hàng !`,
                                image: 'OrderSuccess',
                                link: '/user/order',
                                userId: req.user.id,
                            },
                        });
                        if (notification) {
                            await UserRepository.update(req.user.id, {
                                notificationIdList: [...user.notificationIdList, notification.id],
                            });
                            ReqNotification(req.user.id);
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
            const order = await OrdersRepository.find(orderId);
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
                const order_new = await OrdersRepository.update(orderId, {
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
            const order = await OrdersRepository.find(orderId);
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
                const order_new = await OrdersRepository.update(orderId, {
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

    async createReview(req) {
        try {
            ///handle save video////////
            const modifyHtmlContent = (html) => {
                const updatedHtml = html.replace(/\\/g, '/');
                const oldPath = `/uploads/temporary`;
                const newPath = '/permanent';

                return updatedHtml.replace(new RegExp(oldPath, 'g'), newPath);
            };
            const modifiedHtml = modifyHtmlContent(req.body.content);
            //------------------------------////////
            const paths = [];
            const iframeRegex = /<iframe [^>]*src="([^"]+)"[^>]*>/g;
            let match;
            while ((match = iframeRegex.exec(modifiedHtml)) !== null) {
                paths.push(match[1]);
            }
            const filteredPaths = paths.map((path) => {
                const index = path.indexOf('/permanent');
                return index !== -1 ? path.substring(index) : path;
            });
            //------------------------------////////
            const saveFiles = async (paths) => {
                for (const filePath of filteredPaths) {
                    const staticPath = path.join(process.cwd(), 'static/assets', filePath);
                    const filePath_modify = path.join(
                        process.cwd(),
                        'static/assets',
                        filePath.replace('/permanent', '/uploads/temporary'),
                    );
                    fs.mkdirSync(path.dirname(staticPath), { recursive: true });
                    fs.copyFileSync(filePath_modify, staticPath);
                    console.log(`File saved to: ${staticPath}`);
                }
            };
            saveFiles(paths).catch(console.error);
            ///////--------data------////////
            const review = await ReviewRepository.db.create({
                data: {
                    userId: req.user.id,
                    productId: req.body.productId,
                    rate: parseFloat(req.body.rate),
                    content: modifyHtmlContent(req.body.content),
                    orderDetailId: req.body.orderDetailId,
                },
            });
            if (review) {
                const new_user = await UserRepository.update(req.user.id, {
                    reviewIdList: [...req.user.reviewIdList, review.id],
                });
                const product = await ProductRepository.find(req.body.productId);
                if (product) {
                    await ProductRepository.update(req.body.productId, {
                        reviewIdList: [...product.reviewIdList, review.id],
                    });
                }
                const orderDetail = await OrderDetailRepository.find(req.body.orderDetailId);
                if (orderDetail) {
                    await OrderDetailRepository.update(req.body.orderDetailId, { reviewId: review.id });
                }
                if (new_user) {
                    return new_user;
                } else {
                    return 'Fail';
                }
            } else {
                return 'Fail';
            }
        } catch {
            return 'Fail';
        }
    }

    async getNotificationByUserisCTV(userId) {
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

    async getMessageUserToShop(req) {
        try {
            const messages = await MessageRepository.getMessageUserToShop(req);
            if (messages) {
                return messages;
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }

    async addMessage(req) {
        try {
            const message = await MessageRepository.find(req.body.messageId);
            const shop = await ShopRepository.find(message.shopId);
            if (message) {
                const messageDetail = await MessageDetailRepository.db.create({
                    data: {
                        isUserSent: req.body.isUserSent,
                        content: req.body.content,
                        type: req.body.type,
                        messageId: req.body.messageId,
                        status: 'sent',
                    },
                });
                if (messageDetail) {
                    const new_message = await MessageRepository.update(req.body.messageId, {
                        updateDate: new Date(),
                        numberUnread: (message.numberUnread += 1),
                    });
                    ///
                    if (new_message) {
                        ReqMessageNew(shop.userId);
                        return { message: new_message, messageDetail: messageDetail };
                    } else {
                        return 'Fail';
                    }
                    ///
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

    async createMessage(req) {
        try {
            const message = await MessageRepository.db.create({
                data: { userId: req.user.id, shopId: req.body.shopId, numberUnread: 1 },
            });
            const shop = await ShopRepository.find(req.body.shopId);
            if (message) {
                const messageDetail = await MessageDetailRepository.db.create({
                    data: {
                        messageId: message.id,
                        type: 'text',
                        content: 'Hello',
                        isUserSent: true,
                        status: 'sent',
                    },
                });
                if (messageDetail) {
                    ReqMessageNew(shop.userId);
                    return { message, messageDetail };
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

    async getUnread(req) {
        try {
            const shopId = req.params.shopId;
            const message = await MessageRepository.db.findFirst({ where: { userId: req.user.id, shopId: shopId } });
            if (message) {
                const numberUnread = await MessageDetailRepository.db.findMany({
                    where: { messageId: message.id, status: 'sent', isUserSent: false },
                });
                return numberUnread.length;
            } else {
                return 0;
            }
        } catch {
            return 'Fail';
        }
    }

    async depositeWallet(req) {
        try {
            const wallet = await WalletRepository.db.findFirst({ where: { userId: req.user.id } });
            if (wallet) {
                const wallet_new = await WalletRepository.update(wallet.id, {
                    balance: wallet.balance + parseFloat(req.body.balance),
                });
                if (wallet_new) {
                    const transaction = await TransactionRepository.db.create({
                        data: {
                            value: parseFloat(req.body.balance),
                            describe: 'deposite',
                            walletId: wallet.id,
                            to: wallet.id,
                            from: '-',
                        },
                    });
                    if (transaction) {
                        const notification = await NotificationRepository.db.create({
                            data: {
                                image: 'DepositeSuccess',
                                link: '/user/wallet',
                                userId: req.user.id,
                                describe: `Nạp tiền thành công, số tiền nạp : ${req.body.balance}, số dư TK: ${wallet_new.balance}`,
                            },
                        });
                        if (notification) {
                            ReqNotification(req.user.id);
                        }
                        return { transaction: transaction, wallet: wallet_new };
                    }
                } else {
                    return 'Fail';
                }
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }

    async createWithdraw(req) {
        try {
            const requestWithdraw = await RequestWithdrawRepository.db.findFirst({
                where: {
                    userId: req.user.id,
                    status: 'PENDING',
                },
            });
            if (requestWithdraw) {
                return 'Dont allow to withdraw more';
            } else {
                const wallet = await WalletRepository.db.findFirst({ where: { userId: req.user.id } });
                if (wallet && wallet.balance - parseFloat(req.body.value) > 0) {
                    const requestWithdraw_new = await RequestWithdrawRepository.db.create({
                        data: {
                            userId: req.user.id,
                            value: parseFloat(req.body.value),
                            nameBank: req.body.nameBank,
                            numberBank: req.body.numberBank,
                            nameUser: req.body.nameUser,
                        },
                    });
                    const new_wallet = await WalletRepository.update(req.user.walletId, {
                        balance: wallet.balance - parseFloat(req.body.value),
                    });
                    if (!new_wallet) {
                        return 'Fail';
                    }
                    if (requestWithdraw_new) {
                        const wallet_new = await WalletRepository.update(wallet.id, {
                            balance: wallet.balance - parseFloat(req.body.value),
                        });
                        const notification = await NotificationRepository.db.create({
                            data: {
                                image: 'WithdrawPending',
                                link: '/user/wallet',
                                userId: req.user.id,
                                describe: `Đang xử lý số tiền rút ,số tiền rút : ${req.body.value}, số dư TK: ${wallet_new.balance}`,
                            },
                        });
                        if (notification) {
                            ReqNotification(req.user.id);
                        }
                        return requestWithdraw_new;
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

    async transferToShop(req) {
        try {
            const shop = await ShopRepository.find(req.body.shopId);
            if (!shop) {
                return 'Fail';
            }
            const userShop = await UserRepository.find(shop.userId);
            if (!userShop) {
                return 'Fail';
            }
            const wallet = await WalletRepository.find(userShop.walletId);
            if (!wallet) {
                return 'Fail';
            }

            const transaction = await TransactionRepository.db.create({
                data: {
                    value: 0.95 * parseFloat(req.body.value) - parseFloat(req.body.priceVoucher),

                    from: req.body.from,
                    describe: req.body.describe,
                    walletId: wallet.id,
                    to: wallet.id,
                },
            });
            if (transaction) {
                const wallet_new = await WalletRepository.update(wallet.id, {
                    lockedBalance:
                        wallet.lockedBalance + 0.95 * parseFloat(req.body.value) - parseFloat(req.body.priceVoucher),
                });
                if (wallet_new) {
                    if (req.body.from != '-') {
                        const transaction_user = await TransactionRepository.db.create({
                            data: {
                                value:
                                    parseFloat(req.body.value) -
                                    parseFloat(req.body.priceVoucher) -
                                    parseFloat(req.body.priceMember) +
                                    parseFloat(req.body.priceShip),
                                from: req.body.from,
                                describe: req.body.describe,
                                walletId: req.user.walletId,
                                to: wallet.id,
                            },
                        });
                        if (!transaction_user) {
                            return 'Fail';
                        }
                        if (req.body.from != '-') {
                            const wallet_user = await WalletRepository.find(req.user.walletId);
                            if (
                                wallet_user &&
                                wallet_user.balance >=
                                    parseFloat(req.body.value) -
                                        parseFloat(req.body.priceVoucher) -
                                        parseFloat(req.body.priceMember) +
                                        parseFloat(req.body.priceShip)
                            ) {
                                const wallet__user_new = await WalletRepository.update(req.user.walletId, {
                                    balance:
                                        wallet_user.balance -
                                        parseFloat(req.body.value) +
                                        parseFloat(req.body.priceVoucher) +
                                        parseFloat(req.body.priceMember) -
                                        parseFloat(req.body.priceShip),
                                });
                                if (!wallet__user_new) {
                                    return 'Fail';
                                }
                                return 'True';
                            } else {
                                return 'Fail';
                            }
                        } else {
                            return 'true';
                        }
                    }
                } else {
                    return 'Fail';
                }
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.error(e.messgae);
            return 'Fail';
        }
    }

    async claimVoucher(req) {
        try {
            const voucherId = req.params.voucherId;
            const voucher = await VoucherRepository.find(voucherId);
            if (req.user.voucherIdList.includes(voucherId)) {
                return 'Fail';
            }
            if (req.user.voucherUsedIdList.includes(voucherId)) {
                return 'Voucher used';
            }
            const currentDate = new Date();
            if (new Date(voucher.expired) < currentDate) {
                return 'Fail';
            }
            if (!voucher) {
                return 'Fail';
            }
            if (voucher.quantity > 0) {
                const new_user = await UserRepository.update(req.user.id, {
                    voucherIdList: [...req.user.voucherIdList, voucherId],
                });
                // const new_voucher = await VoucherRepository.update(voucherId, { quantity: voucher.quantity - 1 });
                // if (!new_user || !new_voucher) {
                //     return 'Fail';
                // }
                if (!new_user) {
                    return 'Fail';
                }
                return { new_user };
            } else {
                return 'Run out of voucher';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }

    async getVoucherByCode(req, res) {
        try {
            const currentDate = new Date();
            const shopId = req.params.shopId;
            const code = req.params.code;
            const voucher = await VoucherRepository.db.findFirst({
                where: { code: code, shopId: shopId, expired: { gte: currentDate } },
            });
            if (!voucher) {
                return 'Voucher not found';
            } else {
                if (voucher.quantity == 0) {
                    return 'Run out of voucher';
                }
                if (req.user.voucherUsedIdList.includes(voucher.id)) {
                    return 'Voucher used';
                }
                return voucher;
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }

    async useVoucher(req, res) {
        try {
            const listVoucherId = req.body.voucherUsing.map((item) => item.voucherId);
            if (listVoucherId.length == 0) {
                return true;
            }
            req.body.voucherUsing.map((item) => {
                if (req.user.voucherUsedIdList.includes(item.voucherId)) {
                    return 'Fail';
                }
            });
            const vouchers = await VoucherRepository.db.findMany({
                where: { id: { in: listVoucherId }, quantity: { gt: 0 }, expired: { gte: new Date() } },
            });
            if (vouchers.length == 0) {
                return 'Run out of voucher';
            } else {
                const new_user = await UserRepository.update(req.user.id, {
                    voucherUsedIdList: [...req.user.voucherUsedIdList, ...listVoucherId],
                });
                if (!new_user) {
                    return 'Fail';
                }
                req.body.voucherUsing.map(async (item) => {
                    const index = vouchers.findIndex((itemVoucher) => item.voucherId == itemVoucher.id);
                    if (index != -1) {
                        await VoucherRepository.update(item.voucherId, { quantity: vouchers[index].quantity - 1 });
                    }
                });
                return true;
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }
}
export default new UserService();
