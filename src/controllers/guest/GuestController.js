import CategoryRepository from '../../repositories/CategoryRepository.js';
import MaterialRepository from '../../repositories/MaterialRepository.js';
import BrandRepository from '../../repositories/BrandRepository.js';
import OriginRepository from '../../repositories/OriginRepository.js';
import StylesRepository from '../../repositories/StylesRepository.js';
import ProductDetailRepository from '../../repositories/ProductDetailRepository.js';
import GuestService from '../../services/GuestService.js';
import httpStatus from 'http-status';
import ShopService from '../../services/shop/ShopService.js';
import { logger } from '../../index.js';
import ProductRepository from '../../repositories/ProductRepository.js';
import ShipRepository from '../../repositories/ShipRepository.js';
import DiscountRepository from '../../repositories/DiscountRepository.js';
import ReviewRepository from '../../repositories/ReviewRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import VoucherRepository from '../../repositories/VoucherRepository.js';
import BannerRepository from '../../repositories/BannerRepository.js';

class GuestController {
    initRoutes(app) {
        app.get('/api/product/:id', this.findProductById); // Không yêu cầu authenticate
        app.get('/api/product-detail-by-product/:productId', this.findProductDetailByProductId); // Không yêu cầu authenticate
        app.post('/api/get-product-detail-many', this.findProductDetailMany); // Không yêu cầu authenticate
        app.get('/api/category/:categoryId', this.findCategoryById);
        app.get('/api/product-detail/:productDetailId', this.findProductDetailById); // Không yêu cầu authenticate
        app.get('/api/material/:materialId', this.findMaterialById);
        app.get('/api/brand/:brandId', this.findBrandById);
        app.get('/api/style/:styleId', this.findStylesById);
        app.get('/api/origin/:originId', this.findOriginById);
        app.get('/api/shop/:shopId', this.findShopById);
        app.get('/api/product-by-shop/:shopId', this.findProductByShop_Sorted);
        app.post('/api/top-product-by-shop/:shopId', this.findProductTopByShop);
        app.post('/api/product-many', this.findProduct);
        app.post('/api/search-product-by-name', this.findProductByName);
        app.get('/api/keyword-hot', this.findKeywordHot);
        app.get('/api/product-similar/:productId/:take', this.findProductSimilar);
        app.get('/api/get-category', this.findAllCategory);
        app.get('/api/get-product-top', this.findProductTop);
        app.get('/api/get-product-new', this.findProductNew);
        app.post('/api/get-product-by-category/:categoryId/:take/:step', this.findProductByCategory);
        app.post('/api/get-product-by-shop/:shopId/:take/:step', this.findProductByShop);
        app.get('/api/get-discount/:discountId', this.findDiscountById);
        app.post('/api/discount-many/', this.findDiscountMany);
        app.post('/api/category-many/', this.findManyCategory);
        app.get('/api/get-categories/', this.getAllCategories);
        app.get('/api/all-material', this.findAllMaterial);
        app.get('/api/all-style', this.findAllStyle);
        app.get('/api/all-origin', this.findAllOrigin);
        app.get('/api/all-brand', this.findAllBrand);
        app.get('/api/all-ship', this.findAllShip);
        app.post('/api/product-lstId', this.findProductByListId);
        app.get('/api/ship/:shipId', this.findShipById);
        app.get('/api/shop-discount/:shopId', this.findDiscountsByShop);
        app.get('/api/average-review-by-product/:productId', this.findAverageReviewByProduct);
        app.get('/api/review-by-product/:productId/:take/:skip', this.findReviewByProduct);
        app.get('/api/user-review/:userId', this.getUserReview);
        app.get('/api/get-voucher/:shopId', this.getVoucherByShop);
        app.post('/api/check-cart', this.checkCart);
        app.get('/api/get-banner', this.getBanner);
        app.get('/api/get-banner-common', this.getBannerCommon);
        app.post('/api/category/checktype', this.checkTypeCategory);
    }
    async checkTypeCategory(req, res) {
        try {
            if (req.body.categoryId == '66eac5c7f7adcbed07e215bd') {
                return res.status(httpStatus.OK).json({ message: 'Success', type: 'Men' });
            }
            if (req.body.categoryId == '66eac608a9606d68cd102d21') {
                return res.status(httpStatus.OK).json({ message: 'Success', type: 'Women' });
            }
            const categoryMen = await CategoryRepository.find('66eac5c7f7adcbed07e215bd');
            if (categoryMen.categoryIdClIST.includes(req.body.categoryId)) {
                return res.status(httpStatus.OK).json({ message: 'Success', type: 'Men' });
            }
            const categoryWomen = await CategoryRepository.find('66eac608a9606d68cd102d21');
            if (categoryWomen.categoryIdClIST.includes(req.body.categoryId)) {
                return res.status(httpStatus.OK).json({ message: 'Success', type: 'Women' });
            }
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getBannerCommon(req, res) {
        try {
            const currentDate = new Date();
            let banner_common = await BannerRepository.db.findMany({
                where: { level: 'COMMON', expired: { gte: currentDate }, active: true },
                orderBy: { createDate: 'asc' },
                take: 3,
            });
            if (banner_common.length == 3) {
                return res.status(httpStatus.OK).json({ message: 'Success', banner: banner_common });
            } else {
                const banner_default = await BannerRepository.db.findMany({
                    where: { level: 'DEFAULT', expired: { gte: currentDate } },
                    orderBy: { createDate: 'asc' },
                    take: 3 - banner_common.length,
                });
                banner_common = [...banner_common, ...banner_default];
                return res.status(httpStatus.OK).json({ message: 'Success', banner: banner_common });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getBanner(req, res) {
        try {
            const currentDate = new Date();
            const banner_premium = await BannerRepository.db.findMany({
                where: { level: 'PREMIUM', expired: { gte: currentDate }, active: true },
                orderBy: { createDate: 'asc' },
            });
            if (banner_premium.length < 4) {
                const banner_common = await BannerRepository.db.findMany({
                    where: { level: 'COMMON', expired: { gte: currentDate }, active: true },
                    orderBy: { createDate: 'asc' },
                    take: 4 - banner_premium.length,
                });
                if (banner_common.length + banner_premium.length < 4) {
                    const banner_default = await BannerRepository.db.findMany({
                        where: { level: 'DEFAULT', expired: { gte: currentDate } },
                        orderBy: { createDate: 'asc' },
                        take: 4 - banner_common.length - banner_premium.length,
                    });
                    const banner = [...banner_premium, ...banner_common, ...banner_default];
                    return res.status(httpStatus.OK).json({ message: 'Success', banner });
                }
                const banner = [...banner_premium, ...banner_common];
                return res.status(httpStatus.OK).json({ message: 'Success', banner });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', banner: banner_premium });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async checkCart(req, res) {
        try {
            const productDetails = await ProductDetailRepository.db.findMany({
                where: { id: { in: req.body.productDetailIds }, active: true, activeByShop: true },
                select: { id: true },
            });
            return res.status(httpStatus.OK).json({ message: 'Success', productDetailIds: productDetails });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getVoucherByShop(req, res) {
        try {
            const shopId = req.params.shopId;
            const voucher = await VoucherRepository.db.findMany({
                where: {
                    shopId: shopId,
                    expired: {
                        gte: new Date(),
                    },
                },
            });
            if (voucher) {
                return res.status(httpStatus.OK).json({ message: 'Success', voucher });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getUserReview(req, res) {
        try {
            const userId = req.params.userId;
            const user = await UserRepository.findUserReview(userId);
            if (user) {
                return res.status(httpStatus.OK).json({ message: 'Success', user });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findReviewByProduct(req, res) {
        try {
            const productId = req.params.productId;
            const take = parseInt(req.params.take);
            const skip = parseInt(req.params.skip);
            const reviews = await ReviewRepository.findByProductId(productId, take, skip);
            if (reviews) {
                return res.status(httpStatus.OK).json({ message: 'Success', reviews });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findAverageReviewByProduct(req, res) {
        try {
            const productId = req.params.productId;
            const averageReview = await ReviewRepository.findAverageReviewByProduct(productId);
            if (averageReview != null) {
                return res.status(httpStatus.OK).json({ message: 'Success', averageReview });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findDiscountsByShop(req, res) {
        try {
            const shopId = req.params.shopId;
            const discounts = await DiscountRepository.findDiscountsByShop(shopId);
            if (discounts) {
                return res.status(httpStatus.OK).json({ message: 'Success', discounts });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
        const shopId = req.params.shopId;
    }
    async findManyCategory(req, res) {
        try {
            const categoryP = await CategoryRepository.find(req.body.categoryPId);
            if (!categoryP) {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
            const categories = await CategoryRepository.findManyCategory(categoryP.categoryIdClIST);
            if (categories) {
                return res.status(httpStatus.OK).json({ message: 'Success', categories });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getAllCategories(req, res) {
        try {
            const categories = await CategoryRepository.findAll();
            if (categories) {
                return res.status(httpStatus.OK).json({ message: 'Success', categories });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findShipById(req, res) {
        try {
            const shipId = req.params.shipId;
            const ship = await ShipRepository.find(shipId);
            return res.status(httpStatus.OK).json({ message: 'Success', ship: ship });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findAllShip(req, res) {
        try {
            const ships = await ShipRepository.findAll();
            return res.status(httpStatus.OK).json({ message: 'Success', ships: ships });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductByListId(req, res) {
        try {
            const products = await ProductRepository.findProductByListId(req);
            if (products) {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findAllMaterial(req, res) {
        try {
            const materials = await MaterialRepository.findAll();
            return res.status(httpStatus.OK).json({ message: 'Success', materials });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findAllStyle(req, res) {
        try {
            const styles = await StylesRepository.findAll();
            return res.status(httpStatus.OK).json({ message: 'Success', styles });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findAllOrigin(req, res) {
        try {
            const origins = await OriginRepository.findAll();
            return res.status(httpStatus.OK).json({ message: 'Success', origins });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findAllBrand(req, res) {
        try {
            const brands = await BrandRepository.findAll();
            return res.status(httpStatus.OK).json({ message: 'Success', brands });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findDiscountMany(req, res) {
        try {
            const discountMany = await GuestService.findDiscountMany(req);
            if (discountMany != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', discounts: discountMany });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findDiscountById(req, res) {
        try {
            const discountId = req.params.discountId;
            const discount = await GuestService.findDiscountById(discountId);
            if (discount != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', discount });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductDetailMany(req, res) {
        try {
            const resProductDetail = await GuestService.findProductDetailMany(req);
            if (resProductDetail != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', productDetails: resProductDetail });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductByShop(req, res) {
        try {
            const shopId = req.params.shopId;
            const take = parseInt(req.params.take);
            const step = parseInt(req.params.step);
            const products = await GuestService.findProductByShop(shopId, take, step, req);
            if (products != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const take = req.params.take;
            const step = req.params.step;
            const products = await GuestService.findProductByCategory(categoryId, take, step, req);
            if (products != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductNew(req, res) {
        try {
            const productNews = await GuestService.findProductNew();
            if (productNews == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', productNews });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductTop(req, res) {
        try {
            const productsTop = await GuestService.findProductTop();
            if (productsTop == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', productsTop });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findAllCategory(req, res) {
        try {
            const categories = await CategoryRepository.findAll();
            if (categories) {
                return res.status(httpStatus.OK).json({ message: 'Success', categories });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductSimilar(req, res) {
        try {
            const productId = req.params.productId;
            const take = req.params.take;

            const productsSimilar = await GuestService.findProductSimilar(productId, parseInt(take));
            if (productsSimilar != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', productsSimilar });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findKeywordHot(req, res) {
        try {
            const keywords = await GuestService.findKeywordHot(6);
            if (keywords) {
                return res.status(httpStatus.OK).json({ message: 'Success', keywords });
            } else if (keywords == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProduct(req, res) {
        try {
            const products = await GuestService.findProduct(req.body.take);
            if (products == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductByName(req, res) {
        try {
            const product = await GuestService.findProductByName(req);
            if (product != 'Fail') {
                if (product.length > 0 && req.body.name != '')
                    logger.info({ message: `User searched for: ${req.body.name}`, timestamp: new Date() });
                return res.status(httpStatus.OK).json({ message: 'Success', product });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findProductTopByShop(req, res) {
        try {
            const shopId = req.params.shopId;
            const topProducts = await GuestService.findProductsTopByShop(shopId, req.body.listProductsId);
            if (topProducts != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', topProducts });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductByShop_Sorted(req, res) {
        try {
            const shopId = req.params.shopId;

            const products = await GuestService.findProductsByShop_Sorted(shopId);
            if (products == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findShopById(req, res) {
        try {
            const shopId = req.params.shopId;
            const shop = await ShopService.get(shopId);
            if (shop != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', shop });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findMaterialById(req, res) {
        try {
            const materialId = req.params.materialId;
            const material = await MaterialRepository.find(materialId);
            if (material) {
                return res.status(httpStatus.OK).json({ message: 'Success', material });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.err(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findBrandById(req, res) {
        try {
            const brandId = req.params.brandId;
            const brand = await BrandRepository.find(brandId);
            if (brand) {
                return res.status(httpStatus.OK).json({ message: 'Success', brand });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findStylesById(req, res) {
        try {
            const styleId = req.params.styleId;
            const styles = await StylesRepository.find(styleId);
            if (styles) {
                return res.status(httpStatus.OK).json({ message: 'Success', styles });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findOriginById(req, res) {
        try {
            const originId = req.params.originId;
            const origin = await OriginRepository.find(originId);
            if (origin) {
                return res.status(httpStatus.OK).json({ message: 'Success', origin });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findCategoryById(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const category = await CategoryRepository.find(categoryId);
            if (category) {
                return res.status(httpStatus.OK).json({ message: 'Success', category });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductDetailByProductId(req, res) {
        try {
            const productId = req.params.productId;
            const productDetail = await ProductDetailRepository.findByProductId(productId);
            if (productDetail.length > 0) {
                return res.status(httpStatus.OK).json({ productDetail, message: 'Success' });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductDetailById(req, res) {
        try {
            const productDetailId = req.params.productDetailId;
            const productDetail = await ProductDetailRepository.find(productDetailId);
            return res.status(httpStatus.OK).json({ message: 'Success', productDetail });
        } catch (e) {
            console.error(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductById(req, res) {
        const productId = req.params.id;

        try {
            const product = await GuestService.findProductById(productId);
            if (product == 'Product block') {
                return res.status(200).json({ message: 'Product block' });
            }
            if (product == '404') {
                return res.status(404).json({ message: '404' });
            }
            if (product) {
                return res.status(200).json({ product, message: 'Success' });
            } else {
                return res.status(404).json({ message: 'Not Found' });
            }
        } catch (e) {
            console.error(e.message);
            return res.status(502).json({ message: 'Đã xảy ra lỗi' });
        }
    }
}

export default new GuestController();
