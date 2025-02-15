import { isAuth } from '../../../middleware/auth.middleware.js';
import { publicUploadFile } from '../../../middleware/upload.middleware.js';
import BannerRepository from '../../../repositories/BannerRepository.js';
import BrandRepository from '../../../repositories/BrandRepository.js';
import CategoryRepository from '../../../repositories/CategoryRepository.js';
import MaterialRepository from '../../../repositories/MaterialRepository.js';
import OrdersRepository from '../../../repositories/OrdersRepository.js';
import OriginRepository from '../../../repositories/OriginRepository.js';
import ProductDetailRepository from '../../../repositories/ProductDetailRepository.js';
import ProductRepository from '../../../repositories/ProductRepository.js';
import ReportProductRepository from '../../../repositories/ReportProductRepository.js';
import ReportShopRepository from '../../../repositories/ReportShopRepository.js';
import RequestWithdrawRepository from '../../../repositories/RequestWithdrawRepository.js';
import ShopRepository from '../../../repositories/ShopRepository.js';
import StylesRepository from '../../../repositories/StylesRepository.js';
import TransactionRepository from '../../../repositories/TransactionRepository.js';
import UserRepository from '../../../repositories/UserRepository.js';
import AdminService from '../../../services/admin/AdminService.js';
import AddDataService from '../../../services/admin/data/AddDataService.js';
import DeleteDataService from '../../../services/admin/data/DeleteDataService.js';
import GetDataService from '../../../services/admin/data/GetDataService.js';
import UpdateDataService from '../../../services/admin/data/UpdateDataService.js';
import AuthService from '../../../services/auth/AuthService.js';
import httpStatus from 'http-status';

class CRUDController {
    initRoutes(app) {
        //Data dashboard
        app.get('/admin/get/banner-commission/:month/:year', isAuth, this.totalAndDailyBannerCommissionByMonth);
        app.get('/admin/get/order-commission/:month/:year', isAuth, this.totalAndDailyOrderCommissionByMonth);

        app.get('/admin/get/new-shop-user/:month/:year', isAuth, this.newUserAndNewShopByMonth);
        app.get('/admin/get/total-shop-user', isAuth, this.totalUserAndShop);
        app.get('/admin/get/order-count/:month/:year', isAuth, this.totalAndDailyOrderCountByMonth);

        //
        app.get('/admin/get/report-order', isAuth, this.getReportOrderByAdmin);
        app.get('/admin/get/report-product', isAuth, this.getReportProductByAdmin);
        app.get('/admin/get/report-order/:reportOrderId', isAuth, this.getReportOrderById);

        app.get('/admin/get/categories', isAuth, this.findAllCategories);
        app.get('/admin/get/shops', isAuth, this.findAllShops);
        app.get('/admin/get/users', isAuth, this.findAllUsers);
        app.post('/admin/get/user-by-email', isAuth, this.findUserByEmail);
        app.get('/admin/get/shop/:id', isAuth, this.findShopById);
        app.post('/admin/get/category-by-name', isAuth, this.findCategoryByName);
        app.get('/admin/get/report-shop/:id', isAuth, this.findReportShopById);
        app.get('/admin/get/request-withdraw/:id', isAuth, this.findRequestWithdrawById);

        app.get('/admin/get/transaction', isAuth, this.findAllTransaction);

        app.get('/admin/get/product-by-shop/:shopId', isAuth, this.findAllProductByShop);
        app.get('/admin/get/products', isAuth, this.findAllProduct);

        app.get('/admin/get/number-order/:shopId', isAuth, this.getNumberOrderByShop);
        app.get('/admin/get/number-product/:shopId', isAuth, this.getNumberProductByShop);

        app.get('/admin/get/request-withdraw', isAuth, this.getRequestWithdraw);
        app.post('/admin/accept-withdraw/:requestWithdrawId', isAuth, this.acceptWithdraw);
        app.post('/admin/cancel-withdraw/:requestWithdrawId', isAuth, this.cancelWithdraw);

        app.get('/admin/get/report-shop', isAuth, this.getReportShop);
        app.post('/admin/decrease-point-shop/:reportShopId', isAuth, this.decreasePointShop);
        app.post('/admin/cancel-report-shop/:reportShopId', isAuth, this.cancelReportShop);
        //add
        app.post('/admin/add/category', isAuth, this.addCategory);
        app.post('/admin/check-name-category', isAuth, this.checkNameCategory);
        //update
        app.post('/admin/update/request-explain-reportProduct', isAuth, this.requestExplainReportProduct);
        app.post('/admin/update/category', isAuth, this.updateCategory);
        app.get('/admin/update/reject-reportOrder/:reportOrderId', isAuth, this.rejectReportOrder);
        app.get('/admin/update/refund-report-order/:reportOrderId', isAuth, this.refundReportOrder);

        //delete
        app.post('/admin/delete/category/:categoryId', isAuth, this.deleteCategory);
        app.post('/admin/ban-product/:productId', isAuth, this.banProduct);
        app.post('/admin/ban-shop/:shopId', isAuth, this.banShop);
        app.post('/admin/unban-shop/:shopId', isAuth, this.unBanShop);
        app.post('/admin/ban-user/:userId', isAuth, this.banUser);
        app.post('/admin/unban-user/:userId', isAuth, this.unBanUser);

        //attribute
        app.get('/admin/get/origins', isAuth, this.findAllOrigins);
        app.get('/admin/get/styles', isAuth, this.findAllStyles);
        app.get('/admin/get/brands', isAuth, this.findAllBrand);
        app.get('/admin/get/materials', isAuth, this.findAllMaterial);

        app.post('/admin/get/origin-by-name', isAuth, this.getOriginByName);
        app.post('/admin/get/brand-by-name', isAuth, this.getBrandByName);
        app.post('/admin/get/material-by-name', isAuth, this.getMaterialByName);
        app.post('/admin/get/styles-by-name', isAuth, this.getStylesByName);

        app.post('/admin/delete/origin/:originId', isAuth, this.deleteOrigin);
        app.post('/admin/delete/brand/:brandId', isAuth, this.deleteBrand);
        app.post('/admin/delete/material/:materialId', isAuth, this.deleteMaterial);
        app.post('/admin/delete/styles/:stylesId', isAuth, this.deleteStyles);

        app.post('/admin/create/origin', isAuth, this.createOrigin);
        app.post('/admin/create/brand', isAuth, this.createBrand);
        app.post('/admin/create/styles', isAuth, this.createStyles);
        app.post('/admin/create/material', isAuth, this.createMaterial);

        app.post('/admin/edit/origin/:originId', isAuth, this.editOrigin);
        app.post('/admin/edit/brand/:brandId', isAuth, this.editBrand);
        app.post('/admin/edit/styles/:stylesId', isAuth, this.editStyles);
        app.post('/admin/edit/material/:materialId', isAuth, this.editMaterial);
    }

    async getReportOrderByAdmin(req, res) {
        try {
            const reportOrders = await GetDataService.getReportOrderByAdmin();
            if (reportOrders) {
                return res.status(httpStatus.OK).json({ message: 'Success', reportOrders });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getReportProductByAdmin(req, res) {
        try {
            const reportProducts = await GetDataService.getReportProductByAdmin();
            if (reportProducts) {
                return res.status(httpStatus.OK).json({ message: 'Success', reportProducts });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async getReportOrderById(req, res) {
        try {
            const reportOrderId = req.params.reportOrderId;
            const reportOrder = await GetDataService.getReportOrderById(reportOrderId);
            if (reportOrder) {
                return res.status(httpStatus.OK).json({ message: 'Success', reportOrder });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async editMaterial(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                if (!req.params.materialId) {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
                const new_material = await MaterialRepository.update(req.params.materialId, { name: req.body.name });
                if (new_material) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async editStyles(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                if (!req.params.stylesId) {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
                const new_styles = await StylesRepository.update(req.params.stylesId, { name: req.body.name });
                if (new_styles) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async editBrand(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                if (!req.params.brandId) {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
                const new_brand = await BrandRepository.update(req.params.brandId, { name: req.body.name });
                if (new_brand) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async editOrigin(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                if (!req.params.originId) {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
                const new_origin = await OriginRepository.update(req.params.originId, { name: req.body.name });
                if (new_origin) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async checkNameCategory(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const check = await CategoryRepository.db.findFirst({
                    where: { name: { equals: req.body.name, mode: 'insensitive' }, active: true },
                });
                if (check) {
                    return res.status(httpStatus.OK).json({ message: 'Already exists' });
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
    async createMaterial(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const check = await MaterialRepository.db.findFirst({
                    where: {
                        name: {
                            equals: req.body.name,
                            mode: 'insensitive',
                        },
                        active: true,
                    },
                });
                if (check) {
                    return res.status(httpStatus.OK).json({ message: 'Already exists' });
                }
                const material = await MaterialRepository.db.create({ data: { name: req.body.name } });
                if (material) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async createBrand(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const check = await BrandRepository.db.findFirst({
                    where: {
                        name: {
                            equals: req.body.name,
                            mode: 'insensitive',
                        },
                        active: true,
                    },
                });
                if (check) {
                    return res.status(httpStatus.OK).json({ message: 'Already exists' });
                }
                const brand = await BrandRepository.db.create({ data: { name: req.body.name } });
                if (brand) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async createStyles(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const check = await StylesRepository.db.findFirst({
                    where: {
                        name: {
                            equals: req.body.name,
                            mode: 'insensitive',
                        },
                        active: true,
                    },
                });
                if (check) {
                    return res.status(httpStatus.OK).json({ message: 'Already exists' });
                }
                const styles = await StylesRepository.db.create({ data: { name: req.body.name } });
                if (styles) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async createOrigin(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const check = await OriginRepository.db.findFirst({
                    where: {
                        name: {
                            equals: req.body.name,
                            mode: 'insensitive',
                        },
                        active: true,
                    },
                });
                if (check) {
                    return res.status(httpStatus.OK).json({ message: 'Already exists' });
                }
                const origin = await OriginRepository.db.create({ data: { name: req.body.name } });
                if (origin) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async deleteBrand(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const brand = await BrandRepository.update(req.params.brandId, { active: false });
                if (brand) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async deleteMaterial(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                await MaterialRepository.update(req.params.materialId, { active: false });
                return res.status(httpStatus.OK).json({ message: 'Success' });
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async deleteStyles(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                await StylesRepository.update(req.params.stylesId, { active: false });
                return res.status(httpStatus.OK).json({ message: 'Success' });
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async deleteOrigin(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const origin = await OriginRepository.update(req.params.originId, { active: false });
                if (origin) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getBrandByName(req, res) {
        try {
            const brands = await BrandRepository.db.findMany({
                where: { name: { contains: req.body.name, mode: 'insensitive' }, active: true },
            });
            return res.status(httpStatus.OK).json({ message: 'Success', brands });
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getStylesByName(req, res) {
        try {
            const styles = await StylesRepository.db.findMany({
                where: { name: { contains: req.body.name, mode: 'insensitive' }, active: true },
            });
            return res.status(httpStatus.OK).json({ message: 'Success', styles });
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getMaterialByName(req, res) {
        try {
            const materials = await MaterialRepository.db.findMany({
                where: { name: { contains: req.body.name, mode: 'insensitive' }, active: true },
            });
            return res.status(httpStatus.OK).json({ message: 'Success', materials });
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getOriginByName(req, res) {
        try {
            const origins = await OriginRepository.db.findMany({
                where: { name: { contains: req.body.name, mode: 'insensitive' }, active: true },
            });
            return res.status(httpStatus.OK).json({ message: 'Success', origins });
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findAllOrigins(req, res) {
        try {
            const origins = await OriginRepository.db.findMany({ where: { active: true } });
            return res.status(httpStatus.OK).json({ message: 'Success', origins });
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findAllBrand(req, res) {
        try {
            const brands = await BrandRepository.db.findMany({ where: { active: true } });
            return res.status(httpStatus.OK).json({ message: 'Success', brands });
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findAllStyles(req, res) {
        try {
            const styles = await StylesRepository.db.findMany({ where: { active: true } });
            return res.status(httpStatus.OK).json({ message: 'Success', styles });
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findAllMaterial(req, res) {
        try {
            const materials = await MaterialRepository.db.findMany({ where: { active: true } });
            return res.status(httpStatus.OK).json({ message: 'Success', materials });
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findReportShopById(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const pattern = /^[0-9a-fA-F]{24}$/;
                if (!pattern.test(req.params.id)) {
                    const reportShop = await ReportShopRepository.db.findMany({
                        where: { check: false },
                        orderBy: { createDate: 'desc' },
                    });
                    return res.status(httpStatus.OK).json({ message: 'Success', reportShop });
                }
                if (req.params.id.length == 24) {
                    const reportShop = await ReportShopRepository.db.findFirst({
                        where: { id: req.params.id, check: false },
                    });
                    if (reportShop) {
                        return res.status(httpStatus.OK).json({ message: 'Success', reportShop: [reportShop] });
                    } else {
                        const reportShop = await ReportShopRepository.db.findMany({
                            where: { check: false },
                            orderBy: { createDate: 'desc' },
                        });
                        return res.status(httpStatus.OK).json({ message: 'Success', reportShop });
                    }
                } else {
                    const reportShop = await ReportShopRepository.db.findMany({
                        where: { check: false },
                        orderBy: { createDate: 'desc' },
                    });
                    return res.status(httpStatus.OK).json({ message: 'Success', reportShop });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findRequestWithdrawById(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const pattern = /^[0-9a-fA-F]{24}$/;
                if (!pattern.test(req.params.id)) {
                    const requestWithdraw = await RequestWithdrawRepository.db.findMany({
                        where: { status: 'PENDING' },
                        orderBy: { createDate: 'desc' },
                    });
                    return res.status(httpStatus.OK).json({ message: 'Success', requestWithdraw });
                }
                if (req.params.id.length == 24) {
                    const requestWithdraw = await RequestWithdrawRepository.db.findFirst({
                        where: { id: req.params.id, status: 'PENDING' },
                    });
                    if (requestWithdraw) {
                        return res
                            .status(httpStatus.OK)
                            .json({ message: 'Success', requestWithdraw: [requestWithdraw] });
                    } else {
                        const requestWithdraw = await RequestWithdrawRepository.db.findMany({
                            where: { status: 'PENDING' },
                            orderBy: { createDate: 'desc' },
                        });
                        return res.status(httpStatus.OK).json({ message: 'Success', requestWithdraw });
                    }
                } else {
                    const requestWithdraw = await RequestWithdrawRepository.db.findMany({
                        where: { status: 'PENDING' },
                        orderBy: { createDate: 'desc' },
                    });
                    return res.status(httpStatus.OK).json({ message: 'Success', requestWithdraw });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findCategoryByName(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const categories = await CategoryRepository.db.findMany({
                    where: { name: { contains: req.body.name, mode: 'insensitive' }, active: true },
                });
                return res.status(httpStatus.OK).json({ message: 'Success', categories });
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findShopById(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const pattern = /^[0-9a-fA-F]{24}$/;
                if (!pattern.test(req.params.id)) {
                    const shop = await ShopRepository.findAll();
                    return res.status(httpStatus.OK).json({ message: 'Success', shop });
                }
                if (req.params.id.length == 24) {
                    const shop = await ShopRepository.db.findFirst({ where: { id: req.params.id } });
                    if (shop) {
                        return res.status(httpStatus.OK).json({ message: 'Success', shop: [shop] });
                    } else {
                        const shop = await ShopRepository.findAll();
                        return res.status(httpStatus.OK).json({ message: 'Success', shop });
                    }
                } else {
                    const shop = await ShopRepository.findAll();
                    return res.status(httpStatus.OK).json({ message: 'Success', shop });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findUserByEmail(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const users = await UserRepository.db.findMany({
                    where: { email: { contains: req.body.email, mode: 'insensitive' } },
                });
                return res.status(httpStatus.OK).json({ message: 'Success', users });
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
    async banProduct(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const productId = req.params.productId;
                const {reportProductId } = req.body;
                const product = await ProductRepository.find(productId);
                const reportProduct = await ReportProductRepository.db.update({
                    where:{
                        id: reportProductId
                    },
                    data:{
                        checkByAdmin: true
                    }
                })
                if (!product) {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
                const new_product = await ProductRepository.update(productId, { active: false });
                if (!new_product) {
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
    async findAllUsers(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const users = await UserRepository.findAll();
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
    async findAllTransaction(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const transactions = await TransactionRepository.findAll();
                if (transactions) {
                    return res.status(httpStatus.OK).json({ message: 'Success', transactions });
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

    async totalAndDailyBannerCommissionByMonth(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const month = req.params.month;
                const year = req.params.year;
                const totalBannerCommission = await GetDataService.getTotalBannerCommission(month, year);
                const dailyBannerCommission = await GetDataService.getDailyBannerCommissionByMonth(month, year);
                if (totalBannerCommission || dailyBannerCommission) {
                    return res
                        .status(httpStatus.OK)
                        .json({ message: 'Success', totalBannerCommission, dailyBannerCommission });
                } else {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async totalAndDailyOrderCommissionByMonth(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const month = req.params.month;
                const year = req.params.year;

                const totalOrderCommission = await GetDataService.getTotalOrderCommission(month, year);
                const dailyOrderCommission = await GetDataService.getDailyOrderCommission(month, year);

                if (totalOrderCommission || dailyOrderCommission) {
                    return res
                        .status(httpStatus.OK)
                        .json({ message: 'Success', totalOrderCommission, dailyOrderCommission });
                } else {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async newUserAndNewShopByMonth(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const month = req.params.month;
                const year = req.params.year;

                const totalNewShops = await GetDataService.getTotalNewShopsByMonth(month, year);
                const totalNewUsers = await GetDataService.getTotalNewUsersByMonth(month, year);

                if (totalNewShops || totalNewUsers) {
                    return res.status(httpStatus.OK).json({ message: 'Success', totalNewShops, totalNewUsers });
                } else {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async totalUserAndShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const totalShops = await GetDataService.getTotalShops();
                const totalUsers = await GetDataService.getTotalUsers();

                if (totalShops || totalUsers) {
                    return res.status(httpStatus.OK).json({ message: 'Success', totalShops, totalUsers });
                } else {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async totalAndDailyOrderCountByMonth(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const month = req.params.month;
                const year = req.params.year;

                const totalOrders = await GetDataService.getTotalOrdersByMonthForAdmin(month, year);
                const dailyOrders = await GetDataService.dailyOrderCountForAdmin(month, year);

                if (totalOrders || dailyOrders) {
                    return res.status(httpStatus.OK).json({ message: 'Success', totalOrders, dailyOrders });
                } else {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async cancelReportShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const new_reportShop = await ReportShopRepository.update(req.params.reportShopId, { check: true });
                if (new_reportShop) {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async decreasePointShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const reportShopId = req.params.reportShopId;
                const new_reportShop = await ReportShopRepository.update(reportShopId, { check: true });
                if (!new_reportShop) {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
                const shop = await ShopRepository.find(new_reportShop.shopId);
                if (!shop) {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
                const new_shop = await ShopRepository.update(new_reportShop.shopId, {
                    point: shop.point - req.body.decrease,
                });
                if (new_shop) {
                    if (new_shop.point <= 0) {
                        const new_shop = await ShopRepository.update(new_shop.id, { active: false });
                        const new_products = await ProductRepository.db.updateMany({
                            where: { shopId: new_shop.id },
                            data: { active: false },
                        });
                        const product_by_shop = await ProductRepository.db.findMany({
                            where: { shopId: new_shop.id },
                            select: { id: true },
                        });
                        if (product_by_shop.length > 0) {
                            const productIdList = product_by_shop.map((item) => item.id);
                            const new_product_details = await ProductDetailRepository.db.updateMany({
                                where: { productId: { in: productIdList } },
                                data: { active: false },
                            });
                            if (!new_shop || !new_product_details) {
                                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                            }
                            return res.status(httpStatus.OK).json({ message: 'Success' });
                        } else {
                            return res.status(httpStatus.OK).json({ message: 'Success' });
                        }
                    }
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async acceptWithdraw(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const respone = await AdminService.acceptWithdraw(req);
                if (respone != 'Fail') {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async cancelWithdraw(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const respone = await AdminService.cancelWithdraw(req);
                if (respone != 'Fail') {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getRequestWithdraw(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const requestWithdraw = await RequestWithdrawRepository.db.findMany({
                    where: { status: 'PENDING' },
                    orderBy: { createDate: 'desc' },
                });
                if (requestWithdraw) {
                    return res.status(httpStatus.OK).json({ message: 'Success', requestWithdraw });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getReportShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const reportShop = await ReportShopRepository.db.findMany({
                    where: { check: false },
                    orderBy: { createDate: 'desc' },
                });
                if (reportShop) {
                    return res.status(httpStatus.OK).json({ message: 'Success', reportShop });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getNumberOrderByShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const shopId = req.params.shopId;
                const orders = await OrdersRepository.db.findMany({ where: { shopId: shopId } });
                if (orders) {
                    return res.status(httpStatus.OK).json({ message: 'Success', number: orders.length });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getNumberProductByShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const shopId = req.params.shopId;
                const products = await ProductRepository.db.findMany({
                    where: { shopId: shopId, active: true },
                    select: { id: true },
                });
                if (products) {
                    return res.status(httpStatus.OK).json({ message: 'Success', number: products.length });
                } else {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async banShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const shopId = req.params.shopId;
                const shop = await ShopRepository.find(shopId);
                if (!shop) {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
                const new_bannerShop = await BannerRepository.db.updateMany({
                    where: { shopId: shopId },
                    data: { active: false },
                });
                const new_shop = await ShopRepository.update(shopId, { active: false });
                const new_products = await ProductRepository.db.updateMany({
                    where: { shopId: shopId },
                    data: { active: false },
                });
                const product_by_shop = await ProductRepository.db.findMany({
                    where: { shopId: shopId },
                    select: { id: true },
                });
                if (product_by_shop.length > 0) {
                    const productIdList = product_by_shop.map((item) => item.id);
                    const new_product_details = await ProductDetailRepository.db.updateMany({
                        where: { productId: { in: productIdList } },
                        data: { active: false },
                    });
                    if (!new_shop || !new_product_details) {
                        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                    }
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async unBanShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const shopId = req.params.shopId;
                const shop = await ShopRepository.find(shopId);
                if (!shop) {
                    return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
                }
                const new_bannerShop = await BannerRepository.db.updateMany({
                    where: { shopId: shopId },
                    data: { active: true },
                });
                const new_shop = await ShopRepository.update(shopId, { active: true });
                const new_products = await ProductRepository.db.updateMany({
                    where: { shopId: shopId },
                    data: { active: true },
                });
                const product_by_shop = await ProductRepository.db.findMany({
                    where: { shopId: shopId },
                    select: { id: true },
                });
                if (product_by_shop.length > 0) {
                    const productIdList = product_by_shop.map((item) => item.id);
                    const new_product_details = await ProductDetailRepository.db.updateMany({
                        where: { productId: { in: productIdList } },
                        data: { active: true },
                    });
                    if (!new_shop || !new_product_details) {
                        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
                    }
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                } else {
                    return res.status(httpStatus.OK).json({ message: 'Success' });
                }
            } else {
                return res.status(httpStatus.FORBIDDEN).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async findAllCategories(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
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
    async findAllShops(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const shops = await ShopRepository.findAll();
                if (shops) {
                    return res.status(httpStatus.OK).json({ message: 'Success', shops });
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
    async findAllProductByShop(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const shopId = req.params.shopId;
                const products = await GetDataService.getAllProductByShop(shopId);
                if (products) {
                    return res.status(httpStatus.OK).json({ message: 'Success', products });
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
    async findAllProduct(req, res) {
        try {
            if (AuthService.isAdmin(req)) {
                const products = await GetDataService.getAllProducts();
                if (products) {
                    return res.status(httpStatus.OK).json({ message: 'Success', products });
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

    ///// add
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

    //Update
    async refundReportOrder(req, res) {
        try {
            const reportOrderId = req.params.reportOrderId;
            const refundOrder = await UpdateDataService.refundOrderByAdmin(reportOrderId);
            if (refundOrder != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', refundOrder });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async requestExplainReportProduct(req, res) {
        try {
            const {reportProductId, productName} = req.body;
            const request = await UpdateDataService.requestExplainReportProduct(reportProductId, productName);
            if (request != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', request });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch(e) {
            console.log(e.message)
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async rejectReportOrder(req, res) {
        try {
            const reportOrderId = req.params.reportOrderId;
            const reportOrder = await UpdateDataService.rejectReportOrder(reportOrderId);
            if (reportOrder != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', reportOrder });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async updateCategory(req, res) {
        try {
            publicUploadFile(req, res, async function (err) {
                if (req.file) {
                    if (err) {
                        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Upload Fail', error: err });
                    }
                    req.body.image = req.file.path.slice(req.file.path.indexOf('uploads'));
                }
                const newCategory = await UpdateDataService.updateCategory(req.body);
                if (newCategory === 'Fail') {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
                return res.status(httpStatus.OK).json({ message: 'Success', newCategory });
            });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    //delete
    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const resDeleteCategory = await DeleteDataService.deleteCategory(categoryId);
            if (resDeleteCategory === 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
}
export default new CRUDController();
