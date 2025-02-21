import ColorRepository from '../repositories/ColorRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import StylesRepository from '../repositories/StylesRepository.js';
import TypeRepository from '../repositories/TypeRepository.js';

class ProductService {
    async getProductById(productId) {
        try {
            const product = await ProductRepository.find(productId);
            if (!product) {
                return 'Product not found';
            }
    
            const type = await TypeRepository.find(product.typeId);
            
            const color = await ColorRepository.find(product.colorId);
            
            const styles = await Promise.all(
                product.styleIds.map(styleId => StylesRepository.find(styleId))
            );
    
            return {
                ...product,
                typeName: type ? type.name : null,
                colorName: color ? color.name : null,
                styleNames: styles.map(style => (style ? style.name : null))
            };
        } catch (e) {
            console.log(e.message)
            return 'Fail';
        }
    }
    async getAllProducts() {
        try {
            const products = await ProductRepository.db.findMany({
                where: {
                    active: true,
                },
            });
            return products;
        } catch (e) {
            return 'Fail';
        }
    }
}
export default new ProductService();
