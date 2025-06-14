import httpStatus from 'http-status';
import { publicUploadFile } from '../../middleware/upload.middleware.js';
import GetDataService from '../../services/admin/data/GetDataService.js';
import ProductService from '../../services/ProductService.js';
import ProductDetailService from '../../services/ProductDetailService.js';
import CategoryService from '../../services/CategoryService.js';
import SizeRepository from '../../repositories/SizeRepository.js';
import StylesRepository from '../../repositories/StylesRepository.js';
import ColorRepository from '../../repositories/ColorRepository.js';
import TypeRepository from '../../repositories/TypeRepository.js';
import SizeService from '../../services/SizeService.js';
import CategoryRepository from '../../repositories/CategoryRepository.js';
import AnnouncementService from '../../services/AnnouncementService.js';
import BannerService from '../../services/BannerService.js';

class GuestController {
    initRoutes(app) {
        app.get('/api/categories', this.findAllCategories);
        app.get('/api/category/:categoryId', this.findCategoryById);
        app.get('/api/products', this.findAllProducts);
        app.get('/api/product/:productId', this.findProductById);
        app.get('/api/product-detail-by-product/:productId', this.findProductDetailByProductId);
        app.get('/api/announcements', this.findAllAnnouncements);
        app.get('/api/banners', this.findAllBanners);
        app.post('/api/get-product-detail-many', this.findProductDetailMany);
        app.get('/api/all-size', this.findAllSize);
        app.get('/api/all-style', this.findAllStyle);
        app.get('/api/all-color', this.findAllColor);
        app.get('/api/all-type', this.findAllType);
        app.get('/api/size-by-category/:categoryId', this.findSizesByCategory);
        app.get('/api/style-by-category/:categoryId', this.findStylesByCategory);
        app.get('/api/color-by-category/:categoryId', this.findColorsByCategory);
        app.get('/api/type-by-category/:categoryId', this.findTypesByCategory);
        app.get('/api/type-by-category-name/:categoryName', this.findTypesByCategoryName);
        app.get('/api/style-by-category-name/:categoryName', this.findStylesByCategoryName);
        app.get('/api/color-by-category-name/:categoryName', this.findColorsByCategoryName);
        app.get('/api/size-by-category-name/:categoryName', this.findSizesByCategoryName);

        app.post('/api/get-product-by-category/:categoryId/:take/:step', this.findProductByCategory);

        app.get('/api/get-related-product-by-category/:categoryId/:take/:step', this.findRelatedProductByCategory);
        app.post('/api/get-product-by-categoryName/:categoryName/:take/:step', this.findProductByCategoryName);
        app.post('/api/get-new-product/:take/:step', this.findNewProducts);

        app.post('/api/search-product-by-name', this.findProductByName);
        app.post('/api/search/product-by-name-and-category', this.searchProductByName);
    }

    async findProductByName(req, res) {
        try {
            const product = await ProductService.findProductByNameForGuest(req);
            if (product != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', product });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findAllCategories(req, res) {
        try {
            const categories = await CategoryService.getAllCategories();
            if (categories) {
                return res.status(httpStatus.OK).json({ message: 'Success', categories });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findAllAnnouncements(req, res) {
        try {
            const announcements = await AnnouncementService.getAllAnnouncements();
            if (announcements) {
                return res.status(httpStatus.OK).json({ message: 'Success', announcements });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findAllBanners(req, res) {
        try {
            const banners = await BannerService.getAllBanners();
            if (banners) {
                return res.status(httpStatus.OK).json({ message: 'Success', banners });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findCategoryById(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const category = await CategoryService.getCategory(categoryId);
            if (category) {
                return res.status(httpStatus.OK).json({ message: 'Success', category });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findAllProducts(req, res) {
        try {
            const products = await ProductService.getAllProducts();
            if (products) {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findProductById(req, res) {
        try {
            const productId = req.params.productId;
            const product = await ProductService.getProductById(productId);
            if (product) {
                return res.status(httpStatus.OK).json({ message: 'Success', product });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }

    async findProductDetailByProductId(req, res) {
        try {
            const productId = req.params.productId;
            const productDetails = await ProductDetailService.getProductDetailByProductId(productId);
            if (productDetails.length > 0) {
                return res.status(httpStatus.OK).json({ productDetails, message: 'Success' });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findProductDetailMany(req, res) {
        try {
            const resProductDetail = await ProductDetailService.findProductDetailMany(req);
            if (resProductDetail != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', productDetails: resProductDetail });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findAllSize(req, res) {
        try {
            const sizes = await SizeRepository.findAll();
            return res.status(httpStatus.OK).json({ message: 'Success', sizes });
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

    async findAllColor(req, res) {
        try {
            const colors = await ColorRepository.findAll();
            return res.status(httpStatus.OK).json({ message: 'Success', colors });
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findAllType(req, res) {
        try {
            const types = await TypeRepository.findAll();
            return res.status(httpStatus.OK).json({ message: 'Success', types });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findSizesByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;

            const sizes = await SizeService.findSizesByCategory(categoryId);
            if (sizes) return res.status(httpStatus.OK).json({ message: 'Success', sizes });
            else return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findTypesByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;

            const types = await TypeRepository.db.findMany({
                where: {
                    categoryId: categoryId,
                },
            });
            if (types) return res.status(httpStatus.OK).json({ message: 'Success', types });
            else return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findStylesByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;

            const styles = await StylesRepository.db.findMany({
                where: {
                    categoryId: categoryId,
                },
            });
            if (styles) return res.status(httpStatus.OK).json({ message: 'Success', styles });
            else return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }

    async findColorsByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;

            const colors = await ColorRepository.db.findMany({
                where: {
                    categoryId: categoryId,
                },
            });
            if (colors) return res.status(httpStatus.OK).json({ message: 'Success', colors });
            else return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findTypesByCategoryName(req, res) {
        try {
            const categoryName = req.params.categoryName;
            const category = await CategoryRepository.db.findFirst({
                where: {
                    name: categoryName,
                },
            });
            const types = await TypeRepository.db.findMany({
                where: {
                    categoryId: category.id,
                },
            });
            if (types) return res.status(httpStatus.OK).json({ message: 'Success', types });
            else return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findStylesByCategoryName(req, res) {
        try {
            const categoryName = req.params.categoryName;
            const category = await CategoryRepository.db.findFirst({
                where: {
                    name: categoryName,
                },
            });
            const styles = await StylesRepository.db.findMany({
                where: {
                    categoryId: category.id,
                },
            });
            if (styles) return res.status(httpStatus.OK).json({ message: 'Success', styles });
            else return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findColorsByCategoryName(req, res) {
        try {
            const categoryName = req.params.categoryName;
            const category = await CategoryRepository.db.findFirst({
                where: {
                    name: categoryName,
                },
            });
            const colors = await ColorRepository.db.findMany({
                where: {
                    categoryId: category.id,
                },
            });
            if (colors) return res.status(httpStatus.OK).json({ message: 'Success', colors });
            else return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findSizesByCategoryName(req, res) {
        try {
            const categoryName = req.params.categoryName;
            const category = await CategoryRepository.db.findFirst({
                where: {
                    name: categoryName,
                },
            });
            const sizes = await SizeRepository.db.findMany({
                where: {
                    categoryId: category.id,
                },
            });
            if (sizes) return res.status(httpStatus.OK).json({ message: 'Success', sizes });
            else return res.status(httpStatus.OK).json({ message: 'Success' });
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const take = req.params.take;
            const step = req.params.step;
            const products = await ProductService.findProductByCategory(categoryId, take, step, req);
            if (products != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findRelatedProductByCategory(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const take = req.params.take;
            const step = req.params.step;
            const products = await ProductService.findRelatedProductByCategory(categoryId, take, step);
            if (products != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findProductByCategoryName(req, res) {
        try {
            const categoryName = req.params.categoryName;
            const take = req.params.take;
            const step = req.params.step;
            const products = await ProductService.findProductByCategoryName(categoryName, take, step, req);
            if (products != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async findNewProducts(req, res) {
        try {
            const take = req.params.take;
            const step = req.params.step;
            const products = await ProductService.findNewProducts(take, step, req);
            if (products != 'Fail') {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async searchProductByName(req, res) {
        try {
            const searchTerm = req.body.searchTerm;
            const categoryName = req.body.categoryName;
            const products = await ProductService.searchProductByName(searchTerm,categoryName);
            if (products) {
                return res.status(httpStatus.OK).json({ message: 'Success', products });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Not Found' });
            }
        } catch (e) {
            console.log(e.message);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Fail' });
        }
    }
}
export default new GuestController();
