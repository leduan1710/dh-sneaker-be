import httpStatus from 'http-status';
import { isAuth } from '../../middleware/auth.middleware.js';
import AuthService from '../../services/auth/AuthService.js';
import GetDataService from '../../services/admin/data/GetDataService.js';
import ShopService from '../../services/shop/ShopService.js';
import UserRepository from '../../repositories/UserRepository.js';
import MessageDetailRepository from '../../repositories/MessageDetailRepository.js';
import { publicUploadFile } from '../../middleware/upload.middleware.js';
import MessageRepository from '../../repositories/MessageRepository.js';

class ShopMessageController {
    initRoutes(app) {
        app.get('/shop/get-message', isAuth, this.getMessageShopToUser);
        app.post('/shop/get-opposite', isAuth, this.getOppositeShopToUser);
        app.get('/shop/get-message-detail/:userId', isAuth, this.getMessageDetail);
        app.post('/shop/upload-image-chat', publicUploadFile, isAuth, this.uploadImageChat);
        app.post('/shop/add-message', isAuth, this.addMessage);
        app.get('/shop/get-unread/:userId', isAuth, this.getUnread);
        app.get('/shop/get-user/:userId', isAuth, this.getUser);
    }
    async getUser(req, res) {
        try {
            const userId = req.params.userId;
            const user = await UserRepository.find(userId, { select: { email: true, name: true, image: true } });
            if (user) {
                return res.status(httpStatus.OK).json({ message: 'Success', user });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
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
    async getMessageShopToUser(req, res) {
        try {
            const messages = await ShopService.getMessageShopToUser(req);
            if (messages != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', messages });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async getOppositeShopToUser(req, res) {
        try {
            const opposites = await UserRepository.db.findMany({
                where: { id: { in: req.body.userIdList } },
                select: { id: true, email: true, image: true },
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

    async getMessageDetail(req, res) {
        try {
            const userId = req.params.userId;
            const message = await MessageRepository.db.findFirst({
                where: {
                    userId: userId,
                    shopId: req.user.shopId,
                },
            });
            if (message) {
                const messageDetails = await MessageDetailRepository.findMessageDetailByMessageIdByShop(message.id);
                if (messageDetails) {
                    return res.status(httpStatus.OK).json({ message: 'Success', messageDetails });
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
    async addMessage(req, res) {
        try {
            const addMes = await ShopService.addMessage(req);
            if (addMes != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', addMes });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async getUnread(req, res) {
        try {
            const numberUnread = await ShopService.getUnread(req);
            if (numberUnread != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', numberUnread });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
}
export default new ShopMessageController();
