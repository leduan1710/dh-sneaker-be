import httpStatus from 'http-status';
import { isAuth } from '../../../middleware/auth.middleware.js';
import { publicUploadFile, publicUploadMultiFile } from '../../../middleware/upload.middleware.js';
import GetDataService from '../../../services/admin/data/GetDataService.js';
import AuthService from '../../../services/auth/AuthService.js';
import ProductService from '../../../services/ProductService.js';
import ProductDetailService from '../../../services/ProductDetailService.js';
import OrderService from '../../../services/OrderService.js';
import OrderDetailService from '../../../services/OrderDetailService.js';
import UserService from '../../../services/ctv/UserService.js';
import UserRepository from '../../../repositories/UserRepository.js';

class AdminController {
    initRoutes(app) {
        app.post('/admin/add/category', isAuth, this.addCategory);
        app.get('/admin/get/categories', isAuth, this.findAllCategories);
        app.post('/admin/add/product', isAuth, this.addProduct);

        app.get('/admin/get-new-orders/:take/:step', this.findNewOrderByStep);
        app.get('/admin/get-orders/:take/:step', this.findAllOrderByStep);
        app.post('/admin/post/orderDetail-by-order', isAuth, this.findOrderDetailMany);

        app.get('/admin/update/order-confirmed/:orderId', isAuth, this.confirmedOrder);

        app.get('/admin/update/order-cancelled/:orderId', isAuth, this.cancelledOrder);

        app.get('/admin/get/users', isAuth, this.findAllUsers);
        app.post('/admin/ban-user/:userId', isAuth, this.banUser);
        app.post('/admin/unban-user/:userId', isAuth, this.unBanUser);


    }
    async addProduct(req, res) {
        try {
            publicUploadMultiFile(req, res, async function (err) {
                if (err) {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Upload Fail', error: err });
                }

                if (!req.files || req.files.length === 0) {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'At least one image is required' });
                }

                req.body.imageList = req.files.map((file) => file.path.slice(file.path.indexOf('uploads')));
                req.body.image = req.body.imageList[0];

                req.body.sellPrice = Number(req.body.sellPrice);
                req.body.importPrice = Number(req.body.importPrice);
                req.body.virtualPrice = Number(req.body.virtualPrice);
                req.body.ctvPrice = Number(req.body.ctvPrice);

                if (req.body.styleIds) {
                    req.body.styleIds = JSON.parse(req.body.styleIds);
                }

                const resProduct = await ProductService.saveProduct(req.body);

                if (resProduct.message === 'Fail') {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
                const selectedSizes = JSON.parse(req.body.selectedSizes);
                const product = resProduct.product;
                const productDetails = selectedSizes.map((size) => ({
                    productId: product.id,
                    sizeId: size.sizeId,
                    colorId: product.colorId,
                    quantity: size.quantity,
                    name: product.name,
                    sellPrice: req.body.sellPrice,
                    virtualPrice: req.body.virtualPrice,
                    ctvPrice: req.body.ctvPrice,
                    importPrice: req.body.importPrice,
                    imageList: req.body.imageList,
                    image: req.body.image,
                }));
                await Promise.all(productDetails.map((detail) => ProductDetailService.saveProductDetail(detail)));

                return res.status(httpStatus.OK).json({ message: 'Success', product });
            });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }

    async addProductDetail(req, res) {
        try {
            publicUploadMultiFile(req, res, async function (err) {
                if (err) {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Upload Fail', error: err });
                }

                if (!req.files || req.files.length === 0) {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'At least one image is required' });
                }

                req.body.imagesList = req.files.map((file) => file.path.slice(file.path.indexOf('uploads')));

                req.body.sellPrice = Number(req.body.sellPrice);
                req.body.importPrice = Number(req.body.importPrice);
                req.body.virtualPrice = Number(req.body.virtualPrice);
                req.body.ctvPrice = Number(req.body.ctvPrice);

                req.body.quantity = parseInt(req.body.quantity, 10);

                const resProductDetail = await AddDataService.saveProductDetail(req.body);
                if (resProductDetail.message === 'Fail') {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
                const producDetail = resProductDetail.producDetail;
                return res.status(httpStatus.OK).json({ message: 'Success', producDetail });
            });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }

    async addCategory(req, res) {
        try {
            publicUploadFile(req, res, async function (err) {
                if (err) {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Upload Fail', error: err });
                }

                if (req.file) {
                    req.body.image = req.file.path.slice(req.file.path.indexOf('uploads'));
                    console.log(req.body.image); // Lấy đường dẫn hình ảnh
                } else {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Image is required' });
                }
                const category = await AddDataService.saveCategory(req.body);
                if (category === 'Fail') {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
                return res.status(httpStatus.OK).json({ message: 'Success', category });
            });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    async findAllCategories(req, res) {
        try {
            if (true) {
                const categories = await GetDataService.getAllCategories();
                if (categories) {
                    return res.status(httpStatus.OK).json({ message: 'Success', categories });
                } else {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findNewOrderByStep(req, res) {
        try {
            if (true) {
                const take = req.params.take;
                const step = req.params.step;
                const orders = await OrderService.getNewOrderByStep(take, step);
                if (orders) {
                    return res.status(httpStatus.OK).json({ message: 'Success', orders });
                } else {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findAllOrderByStep(req, res) {
        try {
            if (true) {
                const take = req.params.take;
                const step = req.params.step;
                const orders = await OrderService.getAllOrderByStep(take, step);
                if (orders) {
                    return res.status(httpStatus.OK).json({ message: 'Success', orders });
                } else {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findOrderDetailMany(req, res) {
        try {
            const orderDetailIdList = req.body.orderDetailIdList;
            const orderDetails = await OrderDetailService.getOrderDetailByListId(orderDetailIdList);
            if (orderDetails) {
                return res.status(httpStatus.OK).json({ message: 'Success', orderDetails });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async confirmedOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const order = await OrderService.confirmedOrder(orderId);
            if (order != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', order });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async cancelledOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const order = await OrderService.cancelledOrder(orderId);
            if (order != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', order });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async deliveringOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const order = await UpdateDataService.deliverOrder(orderId);
            if (order != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', order });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async deliveredOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const order = await UpdateDataService.completedOrder(orderId);
            if (order != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', order });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findAllUsers(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const users = await UserService.getAllUsers();
                if (users) {
                    return res.status(httpStatus.OK).json({ message: 'Success', users });
                } else {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async banUser(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const userId = req.params.userId;
                const user = await UserRepository.find(userId);
                if (!user) {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
                const new_user = await UserRepository.update(userId, { active: false });
                if (!new_user) {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
                return res.status(httpStatus.OK).json({ message: 'Success' });
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async unBanUser(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const userId = req.params.userId;
                const user = await UserRepository.find(userId);
                if (!user) {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
                const new_user = await UserRepository.update(userId, { active: true });
                if (!new_user) {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
                return res.status(httpStatus.OK).json({ message: 'Success' });
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
}
export default new AdminController();
