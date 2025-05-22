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

class GuestController {
    initRoutes(app) {
        app.get('/api/categories', this.findAllCategories);
        app.get('/api/category/:categoryId', this.findCategoryById);
        app.get('/api/products', this.findAllProducts);
        app.get('/api/product/:productId', this.findProductById);
        app.get('/api/product-detail-by-product/:productId', this.findProductDetailByProductId);
        app.post('/api/get-product-detail-many', this.findProductDetailMany);
        app.get('/api/all-size', this.findAllSize);
        app.get('/api/all-style', this.findAllStyle);
        app.get('/api/all-color', this.findAllColor);
        app.get('/api/all-type', this.findAllType);
        app.get('/api/size-by-category/:categoryId', this.findSizesByCategory);

        app.get('/api/type-by-category/:categoryId', this.findTypesByCategory);
        app.post('/api/get-product-by-category/:categoryId/:take/:step', this.findProductByCategory);
        app.post('/api/get-product-by-categoryName/:categoryName/:take/:step', this.findProductByCategoryName);
        app.post('/api/get-new-product/:take/:step', this.findNewProducts);

        app.post('/api/search-product-by-name', this.findProductByName);
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
}
export default new GuestController();
