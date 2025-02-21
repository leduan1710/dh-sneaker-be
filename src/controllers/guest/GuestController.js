import httpStatus from 'http-status';
import { publicUploadFile } from '../../middleware/upload.middleware.js';
import GetDataService from '../../services/admin/data/GetDataService.js';
import ProductService from '../../services/ProductService.js';
import ProductDetailService from '../../services/ProductDetailService.js';
import CategoryService from '../../services/CategoryService.js';

class GuestController {
    initRoutes(app) {
        app.get('/api/categories', this.findAllCategories);
        app.get('/api/category/:categoryId', this.findCategoryById);
        app.get('/api/products', this.findAllProducts);
        app.get('/api/product/:productId', this.findProductById);
        app.get('/api/product-detail-by-product/:productId', this.findProductDetailByProductId);
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
            const productDetail = await ProductDetailService.getProductDetailByProductId(productId);
            if (productDetail.length > 0) {
                return res.status(httpStatus.OK).json({ productDetail, message: 'Success' });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
}
export default new GuestController();
