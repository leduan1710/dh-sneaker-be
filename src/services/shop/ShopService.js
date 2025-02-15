import MessageDetailRepository from '../../repositories/MessageDetailRepository.js';
import MessageRepository from '../../repositories/MessageRepository.js';
import ShopRepository from '../../repositories/ShopRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import { ReqMessageNew, ReqMessageShopNew } from '../../controllers/socket/EmitSocket.js';
import VoucherRepository from '../../repositories/VoucherRepository.js';
import ProductRepository from '../../repositories/ProductRepository.js';

class ShopService {
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
            userId: shop.userId,
            active: shop.active,
            point: shop.point,
        };
    };
    async register(req) {
        try {
            if (req.user.shopId) {
                return 'User already exits ';
            }
            const shop = await ShopRepository.findByName(req.body.name);
            if (shop) {
                return 'Shop name already exits';
            }
            req.body.userId = req.user.id;
            const resRegisterShop = await ShopRepository.save(req);
            const resUpdateUser = await UserRepository.update(req.user.id, {
                role: 'SHOP',
                shopId: resRegisterShop.id,
            });
            if (resRegisterShop && resUpdateUser) {
                return resRegisterShop;
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.log(e.message);
        }
    }
    async get(shopId) {
        try {
            const shop = await ShopRepository.find(shopId);
            if (shop) {
                return this.shopDAO(shop);
            } else {
                return 'Fail';
            }
        } catch (e) {
            return 'Fail';
        }
    }

    async getMessageShopToUser(req) {
        try {
            const messages = await MessageRepository.getMessageShopToUser(req);
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
            const message = await MessageRepository.db.findFirst({
                where: { userId: req.body.userId, shopId: req.user.shopId },
            });
            // const user = await UserRepository.find(message.userId);
            if (message) {
                const messageDetail = await MessageDetailRepository.db.create({
                    data: {
                        isUserSent: false,
                        content: req.body.content,
                        type: req.body.type,
                        messageId: message.id,
                        status: 'sent',
                    },
                });
                if (messageDetail) {
                    const new_message = await MessageRepository.update(message.id, {
                        updateDate: new Date(),
                        numberUnread: (message.numberUnread += 1),
                    });
                    ///

                    ReqMessageNew(message.userId);
                    ReqMessageShopNew(req.user.id);
                    ///
                    return { message: new_message, messageDetail: messageDetail };
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
            const userId = req.params.userId;
            const message = await MessageRepository.db.findFirst({
                where: { userId: userId, shopId: req.user.shopId },
            });
            if (message) {
                const numberUnread = await MessageDetailRepository.db.findMany({
                    where: { messageId: message.id, status: 'sent', isUserSent: true },
                });
                return numberUnread.length;
            } else {
                return 0;
            }
        } catch {
            return 'Fail';
        }
    }
    async checkVoucherCode(code) {
        const voucher = await VoucherRepository.db.findUnique({
            where: {
                code: code,
            },
        });
        return !!voucher;
    }
    async checkProductId(productId) {
        const product = await ProductRepository.db.findUnique({
            where: {
                id: productId,
            },
        });
        return !!product;
    }
}
export default new ShopService();
