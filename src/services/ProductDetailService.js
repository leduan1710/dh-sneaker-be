import ProductDetailRepository from '../repositories/ProductDetailRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import SizeRepository from '../repositories/SizeRepository.js';

class ProductDetailService {
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
}
export default new ProductDetailService();
