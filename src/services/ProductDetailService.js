import ProductDetailRepository from '../repositories/ProductDetailRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import SizeRepository from '../repositories/SizeRepository.js';

class ProductDetailService {
    async saveProductDetail(req) {
        try {
            const productDetail = await ProductDetailRepository.saveUpload(req);
            
            await ProductRepository.db.update({
                where: {
                    id: productDetail.productId,
                },
                data: {
                    productCIdList: {
                        push: productDetail.id,
                    },
                },
            });
    
            return {
                message: 'Success',
                productDetail: productDetail,
            };
        } catch (e) {
            console.error(e);
            return {
                message: 'Fail',
                productDetail: null,
            };
        }
    }
    async getProductDetailByProductId(productId) {
        try {
            const productDetails = await ProductDetailRepository.db.findMany({
                where: {
                    productId: productId,
                },
            });
            const sizeIds = productDetails.map((detail) => detail.sizeId);

            const sizes = await Promise.all(sizeIds.map((sizeId) => SizeRepository.find(sizeId)));

            const productDetailsWithSizeName = productDetails.map((detail, index) => ({
                ...detail,
                sizeName: sizes[index] ? sizes[index].name : null,
            }));

            return productDetailsWithSizeName;
        } catch (e) {
            console.log(e.message)
            return 'Fail';
        }
    }
    async findProductDetailMany(req) {
        try {
            const productDetails = await ProductDetailRepository.db.findMany({
                where: {
                    id: {
                        in: req.body.listProductDetailId
                    }
                }
            });
            const sizeIds = productDetails.map((detail) => detail.sizeId);

            const sizes = await Promise.all(sizeIds.map((sizeId) => SizeRepository.find(sizeId)));

            const productDetailsWithSizeName = productDetails.map((detail, index) => ({
                ...detail,
                sizeName: sizes[index] ? sizes[index].name : null,
            }));
            if (productDetailsWithSizeName) {
                return productDetailsWithSizeName;
            } else {
                return 'Fail';
            }
        } catch {
            return 'Fail';
        }
    }
}
export default new ProductDetailService();
