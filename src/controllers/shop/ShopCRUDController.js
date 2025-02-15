import httpStatus from 'http-status';
import { isAuth } from '../../middleware/auth.middleware.js';
import AuthService from '../../services/auth/AuthService.js';
import GetDataService from '../../services/admin/data/GetDataService.js';
import { publicUploadFile, publicUploadMultiFile } from '../../middleware/upload.middleware.js';
import AddDataService from '../../services/admin/data/AddDataService.js';
import DeleteDataService from '../../services/admin/data/DeleteDataService.js';
import UpdateDataService from '../../services/admin/data/UpdateDataService.js';
import ShopService from '../../services/shop/ShopService.js';
import ShopRepository from '../../repositories/ShopRepository.js';
import ProductDetailRepository from '../../repositories/ProductDetailRepository.js';
import ProductRepository from '../../repositories/ProductRepository.js';
import OrdersRepository from '../../repositories/OrdersRepository.js';
import DiscountRepository from '../../repositories/DiscountRepository.js';
import VoucherRepository from '../../repositories/VoucherRepository.js';
import ReportProductRepository from '../../repositories/ReportProductRepository.js';
import nodemailer from 'nodemailer';
import UserRepository from '../../repositories/UserRepository.js';

class ShopCRUDController {
    initRoutes(app) {
        app.get('/shop/get/order-revenue/:month/:year', isAuth, this.orderRevenue);
        app.get('/shop/get/total-revenue/:month/:year', isAuth, this.totalRevenue);
        app.get('/shop/get/top-sell-product/:month/:year', isAuth, this.topSellProduct);
        app.get('/shop/get/daily-data-chart/:month/:year', isAuth, this.dailyRevenueAndOrderByMonth);
        app.get('/shop/get/total-order-productsold/:month/:year', isAuth, this.orderCountAndProductSoldCountByMonth);

        app.get('/shop/get/info-shop', isAuth, this.getInfoShop);
        app.get('/shop/get/products', isAuth, this.findAllProduct);
        app.get('/shop/get/vouchers', isAuth, this.getVoucherByShop);
        app.get('/shop/get/banners', isAuth, this.getBannerByShop);
        app.get('/shop/get/report-order', isAuth, this.getReportOrderByShop);
        app.get('/shop/get/report-product', isAuth, this.getReportProductByShop);
        app.get('/shop/get/discount-by-shop/:shopId', isAuth, this.findAllDiscountByShop);

        app.get('/shop/get/order-by-shop/:shopId', isAuth, this.findAllOrderByShop);
        app.post('/shop/post/orderDetail-by-order', isAuth, this.findOrderDetailMany);

        app.get('/shop/get/productDetail-by-id/:productDetailId', isAuth, this.findProductDetailById);
        app.get('/shop/get/productDetail-by-productId/:productId', isAuth, this.findProductDetailByProductId);
        app.post('/shop/post/productDetail-many', isAuth, this.findProductDetailMany);
        app.get('/shop/get/product-by-shop/:shopId', isAuth, this.findAllProductByShop);
        app.get('/shop/get/productDetail-by-product/:productId', isAuth, this.findAllProductDetailByProductId);

        //add
        app.post('/shop/add/product', isAuth, this.addProduct);
        app.post('/shop/add/voucher', isAuth, this.addVoucher);
        app.post('/shop/add/discount', isAuth, this.addDiscount);
        app.post('/shop/add/signup-banner', isAuth, this.signUpBanner);
        app.post('/shop/add/discount-for-all', isAuth, this.addDiscount);
        app.post('/shop/add/productDetail', isAuth, this.addProductDetail);
        //update
        app.get('/shop/update/order-confirmed/:orderId', isAuth, this.confirmedOrder);
        app.get('/shop/update/order-delivering/:orderId', isAuth, this.deliveringOrder);
        app.get('/shop/update/order-processed/:orderId', isAuth, this.deliveredOrder);
        app.post('/shop/update/product', isAuth, this.editProduct);
        app.post('/shop/update/productDetail', isAuth, this.editProductDetail);
        app.post('/shop/update/voucher', isAuth, this.editVoucher);
        app.post('/shop/update/shop-info', isAuth, this.editShopInfo);
        app.post('/shop/update/discount', isAuth, this.editDiscount);
        app.post('/shop/update/image', isAuth, this.updateImage);
        app.post('/shop/update/status-reportProduct', isAuth, this.checkReportProduct);
        app.post('/shop/update/status-reportOrder', isAuth, this.checkReportOrder);

        app.get('/shop/update/refund-report-order/:reportOrderId', isAuth, this.refundReportOrder);

        //delete
        app.get('/shop/delete-voucher/:voucherId', isAuth, this.deleteVoucher);
        app.get('/shop/cancel-banner/:bannerId', isAuth, this.cancelBanner);
        app.get('/shop/delete-discount/:discountId/:productDetailId', isAuth, this.deleteDiscount);
        app.get('/shop/delete-discount-product/:productId', isAuth, this.deleteDiscountProduct);
        app.post('/shop/delete-voucher-many', isAuth, this.deleteVouchersMany);
        app.post('/shop/delete/product/:productId', isAuth, this.deleteProduct);
        //
        app.post('/shop/check/voucher-code', isAuth, this.checkVoucherCode);
        app.post('/shop/check/productId', isAuth, this.checkProductId);
        //
        app.post('/shop/get/product-by-name', isAuth, this.getProductByName);
        app.get('/shop/get/order/:id', isAuth, this.getOrderById);
        app.get('/shop/get/voucher/:id', isAuth, this.getVoucherById);
        // send email
        app.get('/shop/send-order-email/:orderId', isAuth, this.sendOrderEmail);
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
                const resShop = await ShopRepository.update(req.user.shopId, { image: req.body.image });
                return res.status(httpStatus.OK).json({ message: 'Success', shop: resShop });
            });
        } catch {
            return res.status(httpStatus.OK).json({ message: 'Success', shop: resShop });
        }
    }
    async dailyRevenueAndOrderByMonth(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const month = req.params.month;
                const year = req.params.year;

                const dailyRevenue = await GetDataService.dailyRevenue(req.user.id, month, year);
                const dailyOrderCount = await GetDataService.dailyOrderCount(req.user.id, month, year);
                if (dailyRevenue || dailyOrderCount) {
                    return res.status(httpStatus.OK).json({ message: 'Success', dailyRevenue, dailyOrderCount });
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
    async orderRevenue(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const month = req.params.month;
                const year = req.params.year;

                const orderRevenue = await GetDataService.getOrderRevenueByMonth(req.user.id, month, year);

                if (orderRevenue) {
                    return res.status(httpStatus.OK).json({
                        message: 'Success',
                        orderRevenue: orderRevenue,
                    });
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
    async totalRevenue(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const month = req.params.month;
                const year = req.params.year;

                const totalRevenue = await GetDataService.getTotalRevenueByMonth(req.user.id, month, year);
                const totalDelivering = await GetDataService.getTotalRevenueDeliveringByMonth(req.user.id, month, year);

                if (totalRevenue || totalDelivering) {
                    return res.status(httpStatus.OK).json({
                        message: 'Success',
                        totalRevenue: totalRevenue || 0,
                        totalDelivering: totalDelivering || 0,
                    });
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
    async topSellProduct(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const month = req.params.month;
                const year = req.params.year;

                const topSellProductData = await GetDataService.topSellProduct(req.user.id, month, year);
                if (topSellProductData) {
                    return res.status(httpStatus.OK).json({ message: 'Success', topSellProductData });
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

    async orderCountAndProductSoldCountByMonth(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const month = req.params.month;
                const year = req.params.year;

                const orderCount = await GetDataService.getTotalOrdersByMonth(req.user.id, month, year);
                const deliveringOrderCount = await GetDataService.getTotalOrdersDeliveringByMonth(
                    req.user.id,
                    month,
                    year,
                );
                const totalProductSold = await GetDataService.getTotalProductsSoldByMonth(req.user.id, month, year);

                if (orderCount || totalProductSold) {
                    return res
                        .status(httpStatus.OK)
                        .json({ message: 'Success', orderCount, deliveringOrderCount, totalProductSold });
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
    async getReportProductByShop(req, res) {
        try {
            const reports = await GetDataService.getReportProductByShop(req.user.shopId);
            if (reports) {
                return res.status(httpStatus.OK).json({ message: 'Success', reports });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getBannerByShop(req, res) {
        try {
            const banners = await GetDataService.getBannerByShop(req.user.id);
            if (banners) {
                return res.status(httpStatus.OK).json({ message: 'Success', banners });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getReportOrderByShop(req, res) {
        try {
            const reportOrders = await GetDataService.getReportOrderByShop(req.user.id);
            console.log(req.user.id);
            if (reportOrders) {
                return res.status(httpStatus.OK).json({ message: 'Success', reportOrders });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getVoucherByShop(req, res) {
        try {
            const vouchers = await GetDataService.getVoucherByShop(req.user.id);
            if (vouchers) {
                return res.status(httpStatus.OK).json({ message: 'Success', vouchers });
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
            const order = await UpdateDataService.confirmedOrder(orderId);
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
    async checkReportProduct(req, res) {
        try {
            const { id, shopReason } = req.body;
            const reportProduct = await UpdateDataService.checkReportProduct(id, shopReason);
            if (reportProduct != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', reportProduct });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async checkReportOrder(req, res) {
        try {
            publicUploadFile(req, res, async function (err) {
                if (req.file) {
                    if (err) {
                        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Upload Fail', error: err });
                    }
                    req.body.shopImage = req.file.path.slice(req.file.path.indexOf('uploads'));
                }
                const reportOrder = await UpdateDataService.rejectRefundReportOrder(req.body);
                if (reportOrder === 'Fail') {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
                return res.status(httpStatus.OK).json({ message: 'Success', reportOrder });
            });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async refundReportOrder(req, res) {
        try {
            const reportOrderId = req.params.reportOrderId;
            const refundOrder = await UpdateDataService.refundOrder(reportOrderId);
            if (refundOrder == 'Not enough money') {
                return res.status(httpStatus.OK).json({ message: 'Not enough money' });
            }
            if (refundOrder != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', refundOrder });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async editProduct(req, res) {
        try {
            publicUploadFile(req, res, async function (err) {
                if (req.file) {
                    if (err) {
                        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Upload Fail', error: err });
                    }
                    req.body.image = req.file.path.slice(req.file.path.indexOf('uploads'));
                }
                req.body.price = Number(req.body.price);
                const options = JSON.parse(req.body.options);
                req.body.options = {
                    size: options.sizes,
                    color: options.colors,
                };
                const resProduct = await UpdateDataService.saveProduct(req.body);
                if (resProduct.message === 'Fail') {
                    return res.status(httpStatus.OK).json({ message: 'Fail' });
                }
                const product = resProduct.product;
                // Xóa các productDetail không còn tồn tại
                const existingDetails = await ProductDetailRepository.db.findMany({
                    where: {
                        productId: product.id,
                    },
                });
                const newKeys = createCombinations(options.sizes, options.colors).map(
                    (combo) => `${combo.size}-${combo.color}`,
                );

                // Xóa các productDetail không còn tồn tại
                const deleteResult = await DeleteDataService.deleteProductDetailsByProductId(
                    product.id,
                    existingDetails,
                    newKeys,
                );
                if (deleteResult.message === 'Fail') {
                    return res.status(httpStatus.OK).json({ message: 'Fail' });
                }

                return res.status(httpStatus.OK).json({ message: 'Success', product });
            });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    async editProductDetail(req, res) {
        try {
            publicUploadMultiFile(req, res, async function (err) {
                let images = Array.isArray(req.body.images) ? req.body.images : [];

                if (req.files) {
                    if (err) {
                        return res.status(httpStatus.OK).json({ message: 'Upload Fail', error: err });
                    }
                    req.files.forEach((file) => {
                        images.push(file.path.slice(file.path.indexOf('uploads')));
                    });
                }
                req.body.images = images;
                req.body.price = Number(req.body.price);
                req.body.quantity = parseInt(req.body.quantity, 10);
                const resProductDetail = await UpdateDataService.saveProductDetail(req.body);
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

    async editVoucher(req, res) {
        try {
            const { id, name, code, reduce, condition, quantity, expired, shopId } = req.body;

            // Validate input
            if (!id || !name || !code || reduce < 0 || condition < 0 || quantity < 0) {
                return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid input data.' });
            }

            // Update the voucher in the database
            const updatedVoucher = await UpdateDataService.updateVoucher({
                id,
                name,
                code,
                reduce,
                condition,
                quantity,
                expired,
                shopId,
            });

            if (updatedVoucher) {
                return res.status(httpStatus.OK).json({ message: 'Success', voucher: updatedVoucher });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Voucher not found.' });
            }
        } catch (e) {
            console.error('Error editing voucher:', e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message });
        }
    }
    async editShopInfo(req, res) {
        try {
            const { id, name, phone, address, describe } = req.body;
            const updatedShop = await UpdateDataService.updateShopInfo({
                id,
                name,
                phone,
                address,
                describe,
            });

            if (updatedShop) {
                return res.status(httpStatus.OK).json({ message: 'Success', shop: updatedShop });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Voucher not found.' });
            }
        } catch (e) {
            console.error('Error editing voucher:', e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message });
        }
    }

    async editDiscount(req, res) {
        try {
            const { id, name, percent, productDetailId, shopId, productId } = req.body;

            const updatedDiscount = await UpdateDataService.updateDiscount({
                id,
                name,
                percent,
                productDetailId,
                shopId,
                productId,
            });

            if (updatedDiscount) {
                return res.status(httpStatus.OK).json({ message: 'Success', voucher: updatedDiscount });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Voucher not found.' });
            }
        } catch (e) {
            console.error('Error editing voucher:', e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message });
        }
    }

    async findAllOrderByShop(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const shopId = req.params.shopId;
                const orders = await GetDataService.getAllOrderByShop(shopId);
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
            const orderDetails = await GetDataService.getOrderDetailByListId(orderDetailIdList);
            if (orderDetails) {
                return res.status(httpStatus.OK).json({ message: 'Success', orderDetails });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductDetailById(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const productDetailId = req.params.productDetailId;
                const productDetail = await GetDataService.getProductDetailById(productDetailId);
                if (productDetail) {
                    return res.status(httpStatus.OK).json({ message: 'Success', productDetail });
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
    async findProductDetailByProductId(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const productId = req.params.productId;
                const productDetails = await GetDataService.getAllProductDetailByProductId(productId);
                if (productDetails) {
                    return res.status(httpStatus.OK).json({ message: 'Success', productDetails });
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
    async findProductDetailMany(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const productDetailIdList = req.body.productDetailIdList;
                const productDetails = await GetDataService.getProductDetailMany(productDetailIdList);
                if (productDetails) {
                    return res.status(httpStatus.OK).json({ message: 'Success', productDetails });
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
    async findAllProductByShop(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const shopId = req.params.shopId;
                const products = await GetDataService.getAllProductByShop(shopId);
                if (products) {
                    return res.status(httpStatus.OK).json({ message: 'Success', products });
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
    async findAllDiscountByShop(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const shopId = req.params.shopId;
                const discounts = await GetDataService.getAllDiscountByShop(shopId);
                if (discounts) {
                    return res.status(httpStatus.OK).json({ message: 'Success', discounts });
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
    async findAllProductDetailByProductId(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const producDetailId = req.params.producDetailId;
                const productDetail = await GetDataService.getProductDetailById(producDetailId);
                if (productDetail) {
                    return res.status(httpStatus.OK).json({ message: 'Success', productDetail });
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

    async getInfoShop(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const infoShop = await GetDataService.getInfoShop(req.user.id);
                if (infoShop) {
                    return res.status(httpStatus.OK).json({ message: 'Success', infoShop });
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
    async findAllProduct(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const products = await GetDataService.getAllProducts(req);
                if (products) {
                    return res.status(httpStatus.OK).json({ message: 'Success', products });
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

    ///// add
    async addVoucher(req, res) {
        try {
            const voucherData = req.body;
            const newVoucher = await AddDataService.saveVoucher(voucherData);
            if (newVoucher) return res.status(httpStatus.OK).json({ message: 'Success', voucher: newVoucher });
            else return res.status(httpStatus.OK).json({ message: 'Fail' });
        } catch (e) {
            console.error('Error adding voucher:', e.message);
            return res.status(httpStatus.BAD_REQUEST).json({ message: e.message });
        }
    }
    async addDiscount(req, res) {
        try {
            const { name, percent, shopId, productDetailId, all, productId } = req.body;
            const newDiscount = await AddDataService.saveDiscount({
                name,
                percent,
                shopId,
                productDetailId,
                all,
                productId,
            });
            if (newDiscount) return res.status(httpStatus.CREATED).json({ message: 'Success', voucher: newDiscount });
            else return res.status(httpStatus.CREATED).json({ message: 'Fail' });
        } catch (e) {
            console.error('Error:', e.message);
            return res.status(httpStatus.BAD_REQUEST).json({ message: e.message });
        }
    }
    async signUpBanner(req, res) {
        try {
            publicUploadFile(req, res, async function (err) {
                if (err) {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Upload Fail', error: err });
                }

                if (req.file) {
                    req.body.image = req.file.path.slice(req.file.path.indexOf('uploads'));
                } else {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Image is required' });
                }
                const banner = await AddDataService.saveBanner(req.body, req.user.id);
                if (banner === 'Fail') {
                    return res.status(httpStatus.OK).json({ message: 'Fail' });
                }
                if (banner === 'Not enough money') {
                    return res.status(httpStatus.OK).json({ message: 'Not enough money' });
                }

                return res.status(httpStatus.OK).json({ message: 'Success', banner });
            });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    async addProduct(req, res) {
        try {
            publicUploadFile(req, res, async function (err) {
                if (err) {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Upload Fail', error: err });
                }

                if (req.file) {
                    req.body.image = req.file.path.slice(req.file.path.indexOf('uploads'));
                } else {
                    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Image is required' });
                }
                req.body.price = Number(req.body.price);
                const options = JSON.parse(req.body.options);
                req.body.options = {
                    size: options.sizes,
                    color: options.colors,
                };
                const resProduct = await AddDataService.saveProduct(req.body);
                if (resProduct.message === 'Fail') {
                    return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
                }
                const product = resProduct.product;
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

                req.body.images = req.files.map((file) => file.path.slice(file.path.indexOf('uploads'))); // Lấy tất cả hình ảnh

                req.body.price = Number(req.body.price);
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

    //delete
    async deleteProduct(req, res) {
        try {
            const productId = req.params.productId;
            const resDeleteProduct = await DeleteDataService.deleteProduct(productId);
            if (resDeleteProduct === 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    async deleteVoucher(req, res) {
        try {
            const voucherId = req.params.voucherId;
            const resDeleteVoucher = await DeleteDataService.deleteVoucher(voucherId);
            if (resDeleteVoucher === 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    async cancelBanner(req, res) {
        try {
            const bannerId = req.params.bannerId;
            const resCancelBanner = await DeleteDataService.cancelBanner(bannerId);
            if (resCancelBanner === 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    async deleteDiscount(req, res) {
        try {
            const discountId = req.params.discountId;
            const productDetailId = req.params.productDetailId;
            const resDeleteDiscount = await DeleteDataService.deleteDiscount(discountId, productDetailId);
            if (resDeleteDiscount === 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    async deleteDiscountProduct(req, res) {
        try {
            const productId = req.params.productId;
            const resDeleteDiscount = await DeleteDataService.deleteDiscountProduct(productId);
            if (resDeleteDiscount === 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Fail' });
            }
            return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch (error) {
            console.error(error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
        }
    }
    async deleteVouchersMany(req, res) {
        try {
            const voucherIds = req.body.voucherIds;

            if (!Array.isArray(voucherIds) || voucherIds.length === 0) {
                return res.status(httpStatus.BAD_REQUEST).json({ message: 'Fail' });
            }

            const result = await DeleteDataService.deleteVoucherMany(voucherIds);
            if (result === 'Success') return res.status(httpStatus.OK).json({ message: 'Success' });
            else return res.status(httpStatus.OK).json({ message: 'Fail' });
        } catch (e) {
            console.error('Error deleting vouchers:', e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async checkVoucherCode(req, res) {
        try {
            const { code } = req.body;

            if (!code) {
                return res.status(httpStatus.BAD_REQUEST).json({ message: 'Voucher code is required.' });
            }

            const exists = await ShopService.checkVoucherCode(code);

            return res.status(httpStatus.OK).json({ exists });
        } catch (e) {
            console.error('Error checking voucher code:', e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message });
        }
    }
    async checkProductId(req, res) {
        try {
            const { productId } = req.body;

            const exists = await ShopService.checkProductId(productId);

            return res.status(httpStatus.OK).json({ exists });
        } catch (e) {
            return res.status(httpStatus.OK).json({ message: e.message });
        }
    }

    async getProductByName(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const products = await ProductRepository.db.findMany({
                    where: {
                        name: { contains: req.body.name, mode: 'insensitive' },
                        active: true,
                        activeByShop: true,
                        shopId: req.user.shopId,
                    },
                });
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async getVoucherById(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const pattern = /^[0-9a-fA-F]{24}$/;
                if (!pattern.test(req.params.id)) {
                    const voucher = await VoucherRepository.db.findMany({
                        where: { shopId: req.user.shopId },
                    });
                    return res.status(httpStatus.OK).json({ message: 'Success', voucher });
                }
                if (req.params.id.length == 24) {
                    const voucher = await VoucherRepository.db.findFirst({
                        where: { id: req.params.id, shopId: req.user.shopId },
                    });
                    if (voucher) {
                        return res.status(httpStatus.OK).json({ message: 'Success', voucher: [voucher] });
                    } else {
                        const voucher = await VoucherRepository.db.findMany({
                            where: { shopId: req.user.shopId },
                        });
                        return res.status(httpStatus.OK).json({ message: 'Success', voucher });
                    }
                } else {
                    const voucher = await VoucherRepository.db.findMany({
                        where: { shopId: req.user.shopId },
                    });
                    return res.status(httpStatus.OK).json({ message: 'Success', voucher });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async getOrderById(req, res) {
        try {
            if (AuthService.isCTV(req)) {
                const pattern = /^[0-9a-fA-F]{24}$/;
                if (!pattern.test(req.params.id)) {
                    const order = await OrdersRepository.db.findMany({
                        where: { shopId: req.user.shopId },
                    });
                    return res.status(httpStatus.OK).json({ message: 'Success', order });
                }
                if (req.params.id.length == 24) {
                    const order = await OrdersRepository.db.findFirst({
                        where: { id: req.params.id, shopId: req.user.shopId },
                    });
                    if (order) {
                        return res.status(httpStatus.OK).json({ message: 'Success', order: [order] });
                    } else {
                        const order = await OrdersRepository.db.findMany({
                            where: { shopId: req.user.shopId },
                        });
                        return res.status(httpStatus.OK).json({ message: 'Success', order });
                    }
                } else {
                    const order = await OrdersRepository.db.findMany({
                        where: { shopId: req.user.shopId },
                    });
                    return res.status(httpStatus.OK).json({ message: 'Success', order });
                }
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Access denied' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
    async sendOrderEmail(req, res) {
        const orderId = req.params.orderId;
        const order = await OrdersRepository.find(orderId);
        const user = await UserRepository.find(order.userId);
        const invoiceData = await GetDataService.getDataOrderEmail(order);

        const itemsHTML = invoiceData.items
            .map(
                (item, index) => `
            <h3 style="margin-top: 20px;">${index + 1}. ${item.name}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 8px; border: none;"><strong>Màu sắc:</strong></td>
                    <td style="padding: 8px; border: none;">${item.color}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: none;"><strong>Kích thước:</strong></td>
                    <td style="padding: 8px; border: none;">${item.size}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: none;"><strong>Số lượng:</strong></td>
                    <td style="padding: 8px; border: none;">${item.quantity}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: none;"><strong>Giá:</strong></td>
                    <td style="padding: 8px; border: none;">₫${item.price.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: none;"><strong>Giá giảm từ shop</strong></td>
                    <td style="padding: 8px; border: none;">₫${item.shopDiscount.toLocaleString()}</td>
                </tr>
            </table>
        `,
            )
            .join('');

        const mailOptions = {
            from: 'chauthuanphat10@gmail.com',
            to: `${user.email}`,
            subject: `Đơn hàng ${invoiceData.orderId} đã giao thành công`,
            html: `
            <div style="max-width: 600px; margin: auto; border: 1px solid #ccc; border-radius: 5px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); background-color: #ffffff;">
                <h2 style="text-align: center;">THÔNG TIN ĐƠN HÀNG - DÀNH CHO NGƯỜI MUA</h2>
                <p><strong>Mã đơn hàng:</strong> ${invoiceData.orderId}</p>
                <p><strong>Ngày đặt hàng:</strong> ${invoiceData.orderDate}</p>
                <p><strong>Người bán:</strong> ${invoiceData.recipient}</p>
                
                <h3>Sản phẩm:</h3>
                ${itemsHTML}

                <h3>Thông tin thanh toán:</h3>
                <div style="border: 1px solid #ccc; border-radius: 5px; padding: 10px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border: none;"><strong>Tổng tiền:</strong></td>
                            <td style="padding: 8px; border: none;">₫${invoiceData.total.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: none;"><strong>Voucher từ Shop:</strong></td>
                            <td style="padding: 8px; border: none;">₫${invoiceData.shopVoucher.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: none;"><strong>Mã voucher của Shop:</strong></td>
                            <td style="padding: 8px; border: none;">${invoiceData.voucherCode}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: none;"><strong>Phí vận chuyển:</strong></td>
                            <td style="padding: 8px; border: none;">₫${invoiceData.shippingFee.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: none;"><strong>Giảm giá cho thành viên:</strong></td>
                            <td style="padding: 8px; border: none;">₫${invoiceData.member.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: none;"><strong>Tổng thanh toán:</strong></td>
                            <td style="padding: 8px; border: none;">₫${invoiceData.finalAmount.toLocaleString()}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `,
        };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'chauthuanphat10@gmail.com',
                pass: process.env.GGP,
            },
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error.message);
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(200).json({ message: 'Email sent successfully' });
            }
        });
    }
}
function createCombinations(sizes, colors) {
    const combinations = [];
    sizes.forEach((size) => {
        colors.forEach((color) => {
            combinations.push({ size, color });
        });
    });
    return combinations;
}
export default new ShopCRUDController();
