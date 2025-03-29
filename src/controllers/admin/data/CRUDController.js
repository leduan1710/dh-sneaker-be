import httpStatus from 'http-status';
import { isAuth } from '../../../middleware/auth.middleware.js';
import { publicUploadFile, publicUploadMultiFile } from '../../../middleware/upload.middleware.js';
import GetDataService from '../../../services/admin/data/GetDataService.js';
import AuthService from '../../../services/auth/AuthService.js';
import ProductService from '../../../services/ProductService.js';
import ProductDetailService from '../../../services/ProductDetailService.js';

class CRUDController {
    initRoutes(app) {
        app.post('/admin/add/category', this.addCategory);
        app.get('/admin/get/categories', this.findAllCategories);
        app.post('/admin/add/product', isAuth, this.addProduct);
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
                req.body.image = req.body.imageList[0]

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
                    quantity: size.quantity,
                    name: product.name,
                    sellPrice: req.body.sellPrice,
                    virtualPrice: req.body.virtualPrice,
                    ctvPrice: req.body.ctvPrice,
                    importPrice: req.body.importPrice,
                    imageList: req.body.imageList,
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
}
export default new CRUDController();
