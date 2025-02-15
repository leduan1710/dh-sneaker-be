import httpStatus from 'http-status';
import nodemailer from 'nodemailer';
import md5 from 'md5';
import { isAuth } from '../../middleware/auth.middleware.js';
import UserService from '../../services/user/UserService.js';
import UserRepository from '../../repositories/UserRepository.js';
import { publicUploadFile, publicUploadFileTemporary } from '../../middleware/upload.middleware.js';
import ShopService from '../../services/shop/ShopService.js';
import GuestService from '../../services/GuestService.js';
import OrdersRepository from '../../repositories/OrdersRepository.js';
import OrderDetailRepository from '../../repositories/OrderDetailRepository.js';
import NotificationRepository from '../../repositories/NotificationRepository.js';
import { publicUploadVideo, publicUploadVideoTemporary } from '../../middleware/upload_video.middleware.js';
import ShopRepository from '../../repositories/ShopRepository.js';
import MessageDetailRepository from '../../repositories/MessageDetailRepository.js';
import { ReqMessageNew } from '../socket/EmitSocket.js';
import WalletRepository from '../../repositories/WalletRepository.js';
import TransactionRepository from '../../repositories/TransactionRepository.js';
import RequestWithdrawRepository from '../../repositories/RequestWithdrawRepository.js';
import { addWithOptions } from 'date-fns/fp';
import ReportOrderDetailRepository from '../../repositories/ReportOrderDetailRepository.js';
import ReportShopRepository from '../../repositories/ReportShopRepository.js';
import ReportProductRepository from '../../repositories/ReportProductRepository.js';
import VoucherRepository from '../../repositories/VoucherRepository.js';
import ProductRepository from '../../repositories/ProductRepository.js';
import ProductDetailRepository from '../../repositories/ProductDetailRepository.js';

class UserController {
    initRoutes(app) {
        app.get('/user/get-role', isAuth, this.getRole);
        app.get('/user/get-user', isAuth, this.getUser);
        app.post('/user/logout', isAuth, this.logout);
        app.post('/user/update-user-info', isAuth, this.updateUserInfo);
        app.post('/user/update-image', isAuth, this.updateImage);
        app.post('/user/register-shop', isAuth, this.registerShop);
        app.post('/user/update-default-address', isAuth, this.updateDefaultAddress);
        app.post('/user/delete-address/:addressId', isAuth, this.deleteAddress);
        app.post('/user/change-password', isAuth, this.changePassword);
        app.post('/user/change-password-2fa', isAuth, this.changePassword_2fa);
        app.post('/user/follow-shop', isAuth, this.handleFollowShop);
        app.post('/user/un-follow-shop', isAuth, this.handleUnFollowShop);
        app.post('/user/favorite-product', isAuth, this.handleFavoriteProduct);
        app.post('/user/un-favorite-product', isAuth, this.handleUnFavoriteProduct);
        /////order
        app.post('/user/handle-order', isAuth, this.handleOrder);
        app.post('/user/order-many', isAuth, this.getOrderMany);
        app.post('/user/cancle-order/:orderId', isAuth, this.cancleOrder);
        app.post('/user/re-order/:orderId', isAuth, this.reOrder);
        app.get('/user/order/:orderId', isAuth, this.findOrderById);
        app.get('/user/order-detail/:id', isAuth, this.findOrderDetailById);
        app.post('/user/order-detail-many/', isAuth, this.getOrderDetailMany);
        app.get('/user/get-price-order/:orderId', isAuth, this.getPriceOrder);
        app.post('/user/transfer-to-shop', isAuth, this.transferToShop);
        /// notification
        app.get('/user/get-notification/:limit/:skip', isAuth, this.getNotificationByUser);
        app.get('/user/get-notification-shop', isAuth, this.getNotificationByUserisCTV);
        app.get('/user/read-notification/:notificationId', isAuth, this.handleReadNotification);
        app.post('/user/create-review', isAuth, this.createReview);
        app.post('/user/review-video-tempo', publicUploadVideoTemporary, isAuth, this.uploadVideoReview);
        app.post('/user/upload-image-review', publicUploadFile, isAuth, this.uploadImgReview);
        ///message
        app.get('/user/get-message', isAuth, this.getMessageUserToShop);
        app.post('/user/get-opposite', isAuth, this.getOppositeUserToShop);
        app.get('/user/get-message-detail/:messageId', isAuth, this.getMessageDetail);
        app.post('/user/create-message', isAuth, this.createMessage);
        app.post('/user/upload-image-chat', publicUploadFile, isAuth, this.uploadImageChat);
        app.post('/user/add-message', isAuth, this.addMessage);
        app.get('/user/get-unread/:shopId', isAuth, this.getUnread);
        //wallet
        app.get('/user/get-wallet', isAuth, this.getWalletByUser);
        app.post('/user/create-wallet', isAuth, this.createWallet);
        app.get('/user/get-transaction/:walletId', isAuth, this.getTransaction);
        app.post('/user/deposite-wallet', isAuth, this.depositeWallet);
        app.post('/user/withdraw', isAuth, this.createWithdraw);
        app.get('/user/get-request-withdraw', isAuth, this.getRequestWithdraw);
        //report
        app.post('/user/report-orderDetail', isAuth, this.createReportOrderDetail);
        app.post('/user/report-product', isAuth, this.createReportProduct);
        app.post('/user/report-shop', isAuth, this.createReportShop);
        //voucher
        app.post('/user/claim-voucher/:voucherId', isAuth, this.claimVoucher);
        app.get('/user/get-voucher-by-user', isAuth, this.getVoucherByUser);
        app.get('/user/get-voucher-by-code/:shopId/:code', isAuth, this.getVoucherByCode);
        app.post('/user/use-voucher', isAuth, this.useVoucher);
        //
        app.post('/user/refund/:orderId', isAuth, this.refund);
        app.get('/user/get-number-favorite', isAuth, this.getNumberFavorite);
    }
    async getNumberFavorite(req, res) {
        try {
            const products = await ProductRepository.db.findMany({
                where: { id: { in: req.user.productFavoriteIdList }, active: true, activeByShop: true },
                select: { id: true },
            });
            return res.status(httpStatus.OK).json({ message: 'Success', number: products.length });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async refund(req, res) {
        try {
            const order = await OrdersRepository.find(req.params.orderId);
            if (!order) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            if (order.voucherId) {
                const voucher = await VoucherRepository.find(order.voucherId);
                await VoucherRepository.update(voucher.id, { quantity: voucher.quantity + 1 });
                const new_voucherUsedIdList = req.user.voucherUsedIdList.filter((item) => item !== voucher.id);
                await UserRepository.update(req.user.id, { voucherUsedIdList: new_voucherUsedIdList });
            }
            //increase quantity product detail
            const orderDetails = await OrderDetailRepository.db.findMany({ where: { orderId: order.id } });
            for (const index in orderDetails) {
                await ProductDetailRepository.db.update({
                    where: { id: orderDetails[index].productDetailId },
                    data: { quantity: { increment: orderDetails[index].quantity } },
                });
            }
            //
            const shop = await ShopRepository.find(order.shopId);
            if (!shop) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            const user_shop = await UserRepository.find(shop.userId);
            if (!user_shop) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            const wallet_shop = await WalletRepository.find(user_shop.walletId);
            if (!wallet_shop) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            const wallet_user = await WalletRepository.find(req.user.walletId);
            if (!wallet_user) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            const new_wallet_shop = await WalletRepository.update(wallet_shop.id, {
                lockedBalance:
                    wallet_shop.lockedBalance - 0.95 * parseFloat(req.body.total) + parseFloat(req.body.priceVoucher),
            });
            if (!new_wallet_shop) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            const new_wallet_user = await WalletRepository.update(wallet_user.id, {
                balance:
                    wallet_user.balance +
                    parseFloat(req.body.total) -
                    parseFloat(req.body.priceMember) -
                    parseFloat(req.body.priceVoucher) +
                    parseFloat(req.body.priceShip),
            });
            if (!new_wallet_user) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            //transaction
            const transaction_user = await TransactionRepository.db.create({
                data: {
                    value:
                        parseFloat(req.body.total) -
                        parseFloat(req.body.priceVoucher) -
                        parseFloat(req.body.priceMember) +
                        parseFloat(req.body.priceShip),
                    from: wallet_shop.id,
                    describe: 'transfer',
                    walletId: wallet_user.id,
                    to: wallet_user.id,
                },
            });
            const transaction_shop = await TransactionRepository.db.create({
                data: {
                    value: 0.95 * parseFloat(req.body.total) - parseFloat(req.body.priceVoucher),
                    from: wallet_shop.id,
                    describe: 'transfer',
                    walletId: wallet_shop.id,
                    to: wallet_user.id,
                },
            });
            if (!transaction_shop && !transaction_user) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            await OrdersRepository.delete(req.params.orderId);
            await OrderDetailRepository.db.deleteMany({ where: { orderId: req.params.orderId } });
            return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async useVoucher(req, res) {
        try {
            const resUse = await UserService.useVoucher(req);
            if (resUse == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else if (resUse == 'Run out of voucher') {
                return res.status(httpStatus.OK).json({ message: 'Run out of voucher' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getVoucherByCode(req, res) {
        try {
            const voucher = await UserService.getVoucherByCode(req);
            if (voucher == 'Run out of voucher') {
                return res.status(httpStatus.OK).json({ message: 'Run out of voucher' });
            } else if (voucher == 'Voucher used') {
                return res.status(httpStatus.OK).json({ message: 'Voucher used' });
            } else if (voucher == 'Voucher not found') {
                return res.status(httpStatus.OK).json({ message: 'Voucher not found' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', voucher });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getVoucherByUser(req, res) {
        try {
            const currentDate = new Date();
            const vouchers = await VoucherRepository.db.findMany({
                where: {
                    id: {
                        in: req.user.voucherIdList,
                    },
                    expired: {
                        gte: currentDate,
                    },
                },
            });
            if (vouchers) {
                return res.status(httpStatus.OK).json({ message: 'Success', vouchers });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async claimVoucher(req, res) {
        try {
            const resClaim = await UserService.claimVoucher(req);
            if (resClaim == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else if (resClaim == 'Run out of voucher') {
                return res.status(httpStatus.OK).json({ message: 'Run out of voucher' });
            } else if (resClaim == 'Voucher used') {
                return res.status(httpStatus.OK).json({ message: 'Voucher used' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', new_user: resClaim.new_user });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async createReportShop(req, res) {
        try {
            const resCreate = await ReportShopRepository.db.create({
                data: { describe: req.body.describe, userId: req.user.id, shopId: req.body.shopId },
            });
            const new_user = await UserRepository.update(req.user.id, {
                shopReportIdList: [...req.user.shopReportIdList, req.body.shopId],
            });
            if (resCreate) {
                return res.status(httpStatus.OK).json({ message: 'Success', new_user });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async createReportProduct(req, res) {
        try {
            const resCreate = await ReportProductRepository.db.create({
                data: { describe: req.body.describe, userId: req.user.id, productId: req.body.productId },
            });
            const new_user = await UserRepository.update(req.user.id, {
                productReportIdList: [...req.user.productReportIdList, req.body.productId],
            });
            if (resCreate && new_user) {
                return res.status(httpStatus.OK).json({ message: 'Success', new_user });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async createReportOrderDetail(req, res) {
        try {
            const resCreate = await ReportOrderDetailRepository.db.create({
                data: {
                    describe: req.body.describe,
                    userId: req.user.id,
                    orderDetailId: req.body.orderDetailId,
                    image: req.body.image,
                },
            });
            const new_user = await UserRepository.update(req.user.id, {
                orderDetailReportIdList: [...req.user.orderDetailReportIdList, req.body.orderDetailId],
            });
            if (resCreate && new_user) {
                return res.status(httpStatus.OK).json({ message: 'Success', new_user });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async transferToShop(req, res) {
        try {
            const resTransfer = await UserService.transferToShop(req);
            if (resTransfer != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success' });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getRequestWithdraw(req, res) {
        try {
            const requestWithdraw = await RequestWithdrawRepository.db.findFirst({
                where: {
                    userId: req.user.id,
                    status: 'PENDING',
                },
            });
            return res.status(httpStatus.OK).json({ message: 'Success', requestWithdraw });
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async createWithdraw(req, res) {
        try {
            const requestWithdraw = await UserService.createWithdraw(req);
            if (requestWithdraw == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else if (requestWithdraw == 'Dont allow to withdraw more') {
                return res.status(httpStatus.OK).json({ message: 'Dont allow to withdraw more' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', requestWithdraw });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async depositeWallet(req, res) {
        try {
            const deposite = await UserService.depositeWallet(req);
            if (deposite != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', deposite });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getTransaction(req, res) {
        try {
            const walletId = req.params.walletId;
            const transactions = await TransactionRepository.db.findMany({
                where: { walletId: walletId },
                orderBy: { createDate: 'desc' },
            });
            if (transactions) {
                return res.status(httpStatus.OK).json({ message: 'Success', transactions });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async createWallet(req, res) {
        try {
            const wallet = await WalletRepository.db.create({
                data: {
                    userId: req.user.id,
                    nameBank: req.body.nameBank,
                    numberBank: req.body.numberBank,
                    nameUser: req.body.nameUser,
                },
            });
            if (wallet) {
                const user = await UserRepository.update(req.user.id, { walletId: wallet.id });
                if (user) {
                    return res.status(httpStatus.OK).json({ message: 'Success', wallet });
                } else {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getWalletByUser(req, res) {
        try {
            const wallet = await WalletRepository.db.findMany({ where: { userId: req.user.id } });
            if (wallet) {
                return res.status(httpStatus.OK).json({ message: 'Success', wallet });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async uploadImageChat(req, res) {
        try {
            if (req.file) {
                const path = req.file.path.slice(req.file.path.indexOf('uploads'));
                return res.status(httpStatus.OK).json({ message: 'Success', path });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getUnread(req, res) {
        try {
            const numberUnread = await UserService.getUnread(req);
            if (numberUnread != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', numberUnread });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async createMessage(req, res) {
        try {
            const createMes = await UserService.createMessage(req);
            if (createMes != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', createMes });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async addMessage(req, res) {
        try {
            const addMes = await UserService.addMessage(req);
            if (addMes != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', addMes });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getMessageDetail(req, res) {
        try {
            const messageId = req.params.messageId;
            const messageDetails = await MessageDetailRepository.findMessageDetailByMessageId(messageId);
            if (messageDetails) {
                return res.status(httpStatus.OK).json({ message: 'Success', messageDetails });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async getOppositeUserToShop(req, res) {
        try {
            const opposites = await ShopRepository.db.findMany({
                where: { id: { in: req.body.shopIdList } },
                select: { id: true, name: true, image: true },
            });
            if (opposites) {
                return res.status(httpStatus.OK).json({ message: 'Success', opposites });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getMessageUserToShop(req, res) {
        try {
            const messages = await UserService.getMessageUserToShop(req);
            if (messages != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', messages });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async uploadVideoReview(req, res) {
        try {
            if (req.file) {
                const path = req.file.path.slice(req.file.path.indexOf('uploads'));
                return res.status(httpStatus.OK).json({ message: 'Success', path });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async uploadImgReview(req, res) {
        try {
            if (req.file) {
                const path = req.file.path.slice(req.file.path.indexOf('uploads'));
                return res.status(httpStatus.OK).json({ message: 'Success', path });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async createReview(req, res) {
        try {
            const new_user = await UserService.createReview(req);
            if (new_user != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', new_user });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async handleReadNotification(req, res) {
        try {
            const notificationId = req.params.notificationId;
            const notification = await NotificationRepository.find(notificationId);
            if (notification.userId != req.user.id) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            const notification_new = await NotificationRepository.update(notificationId, { status: 'SEEN' });
            if (notification_new) {
                return res.status(httpStatus.OK).json({ message: 'Success' });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getNotificationByUser(req, res) {
        try {
            const limit = parseInt(req.params.limit);
            const skip = parseInt(req.params.skip);
            const notifications = await NotificationRepository.getNotificationByUser(req, limit, skip);
            if (notifications) {
                return res.status(httpStatus.OK).json({ message: 'Success', notifications });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getNotificationByUserisCTV(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await UserService.getNotificationByUserisCTV(userId);
            if (notifications) {
                return res.status(httpStatus.OK).json({ message: 'Success', notifications });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getPriceOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const price = await OrdersRepository.getPriceOrder(orderId);
            if (price) {
                return res.status(httpStatus.OK).json({ message: 'Success', price });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getOrderDetailMany(req, res) {
        try {
            const orderDetails = await OrderDetailRepository.findOrderDetailMany(req);
            if (orderDetails) {
                return res.status(httpStatus.OK).json({ message: 'Success', orderDetails });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getOrderMany(req, res) {
        try {
            const orders = await OrdersRepository.findOrderMany(req);
            if (orders) {
                return res.status(httpStatus.OK).json({ message: 'Success', orders });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async cancleOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const order = await UserService.cancleOrder(orderId, req);
            if (order != 'Fail') {
                if (order != 'More require') {
                    return res.status(httpStatus.OK).json({ message: 'Success', order });
                } else {
                    return res.status(httpStatus.TOO_MANY_REQUESTS).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async reOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const order = await UserService.reOrder(orderId, req);
            if (order == 'Voucher used') {
                return res.status(httpStatus.OK).json({ message: 'Voucher used' });
            }
            if (order == 'Voucher not found') {
                return res.status(httpStatus.OK).json({ message: 'Voucher not found' });
            }
            if (order == 'Voucher run out of') {
                return res.status(httpStatus.OK).json({ message: 'Voucher run out of' });
            }
            if (order != 'Fail') {
                if (order != 'More require') {
                    return res.status(httpStatus.OK).json({ message: 'Success', order });
                } else {
                    return res.status(httpStatus.TOO_MANY_REQUESTS).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findOrderById(req, res) {
        try {
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findOrderDetailById(req, res) {
        try {
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async handleOrder(req, res) {
        try {
            const orders = await UserService.handleOrder(req);
            if (orders != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', orders });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async deleteAddress(req, res) {
        try {
            const addressId = req.params.addressId;
            const resDeleteAddress = await UserService.deleteAddress(req, addressId);
            if (resDeleteAddress != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', user: resDeleteAddress });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async handleUnFavoriteProduct(req, res) {
        try {
            const resFavorite = await UserService.unFavoriteProduct(req, req.body.productId);
            if (resFavorite != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', user: resFavorite.user });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async handleFavoriteProduct(req, res) {
        try {
            const resFavorite = await UserService.favoriteProduct(req, req.body.productId);
            if (resFavorite != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', user: resFavorite.user });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async handleUnFollowShop(req, res) {
        try {
            const resFollow = await UserService.unFollowShop(req, req.body.shopId);
            if (resFollow != 'Fail') {
                return res
                    .status(httpStatus.OK)
                    .json({ message: 'Success', user: resFollow.user, shop: resFollow.shop });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async handleFollowShop(req, res) {
        try {
            const resFollow = await UserService.followShop(req, req.body.shopId);
            if (resFollow != 'Fail') {
                return res
                    .status(httpStatus.OK)
                    .json({ message: 'Success', user: resFollow.user, shop: resFollow.shop });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async changePassword(req, res) {
        try {
            const resChangePassword = await UserService.changePassword(req);
            if (resChangePassword == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else if (resChangePassword == 'Incorrect password') {
                return res.status(httpStatus.OK).json({ message: 'Incorrect password' });
            } else {
                const fiveMinutesFromNow = new Date(new Date().getTime() + 5 * 60 * 1000);
                const randomOTP = Math.floor(100000 + Math.random() * 900000);
                await UserRepository.update(req.user.id, { code: randomOTP, codeExpiry: fiveMinutesFromNow });
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'chauthuanphat10@gmail.com',
                        pass: process.env.GGP,
                    },
                });
                const mailOptions = {
                    from: 'chauthuanphat10@gmail.com',
                    to: req.body.email,
                    subject: 'Your OTP ',
                    text: String(randomOTP),
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                    } else {
                        return res.status(200).json({ message: 'Email sent successfully' });
                    }
                });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async changePassword_2fa(req, res) {
        try {
            const resChangePassword2Fa = await UserService.changePassword_2fa(req);
            if (resChangePassword2Fa == 'Code expiry') {
                return res.status(httpStatus.OK).json({ message: 'Code expiry' });
            } else if (resChangePassword2Fa == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', user: resChangePassword2Fa });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async updateDefaultAddress(req, res) {
        try {
            const resUpdate = await UserRepository.update(req.user.id, { defaultAddressId: req.body.addressId });
            if (resUpdate) {
                const resUser = await UserService.getUser(req.user.email);
                if (resUser != 'Fail') {
                    return res.status(httpStatus.OK).json({ message: 'Success', user: resUser });
                } else {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async registerShop(req, res) {
        try {
            const resRegisterShop = await ShopService.register(req);
            if (resRegisterShop == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else if (resRegisterShop == 'Shop name already exits') {
                return res.status(httpStatus.CONFLICT).json({ message: 'Shop name already exits' });
            } else if (resRegisterShop == 'User already exits') {
                return res.status(httpStatus.CONFLICT).json({ message: 'User already exits' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success Shop Create', shopId: resRegisterShop.id });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async updateImage(req, res) {
        try {
            publicUploadFile(req, res, async function (err) {
                if (err) {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Fail' });
                }
                if (req.file) {
                    req.body.image = req.file.path.slice(req.file.path.indexOf('uploads'));
                }
                const resUser = await UserRepository.update(req.user.id, { image: req.body.image });
                return res.status(httpStatus.OK).json({ message: 'Success', user: resUser });
            });
        } catch {
            return res.status(httpStatus.OK).json({ message: 'Success', user: resUser });
        }
    }
    async updateUserInfo(req, res) {
        const resUser = await UserService.updateUserInfo(req);
        if (resUser == 'Fail') {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        } else {
            return res.status(httpStatus.OK).json({ message: 'Success', user: resUser });
        }
    }
    async logout(req, res) {
        try {
            await UserRepository.update(req.user.id, { refreshToken: '' });
            return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getRole(req, res) {
        try {
            return res.status(httpStatus.OK).json({ message: 'Success', role: req.user.role });
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Get role fail' });
        }
    }

    async getUser(req, res) {
        try {
            const user = await UserService.getUser(req.user.email);
            if (user == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            if (user.role == 'CTV') {
                const activeShop = await ShopRepository.find(user.shopId, {
                    select: {
                        active: true,
                    },
                });
                user.activeShop = activeShop;
                return res.status(httpStatus.OK).json({ message: 'Success', user });
            }
            return res.status(httpStatus.OK).json({ message: 'Success', user });
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
}
export default new UserController();
