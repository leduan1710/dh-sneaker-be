import ColorRepository from '../repositories/ColorRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import StylesRepository from '../repositories/StylesRepository.js';
import TypeRepository from '../repositories/TypeRepository.js';

class ProductService {
    async findProductByCategory(categoryId, take, step, req) {
        try {
            const products = await ProductRepository.findProductByCategory(categoryId, take, step, req);
            if (products) {
                if (req.body.options.sort == null) {
                    return products;
                }
                if (req.body.options.sort == 'desc') {
                    const sortedProducts = products.sort((a, b) => {
                        return b.price - a.price; // Sắp xếp giảm dần
                    });
                    return sortedProducts;
                }
                if (req.body.options.sort == 'asc') {
                    const sortedProducts = products.sort((a, b) => {
                        return a.price - b.price; // Sắp xếp tăng dần
                    });
                    return sortedProducts;
                }
                if (req.body.options.sort == 'discount') {
                    const productDiscounts = products.map((item) => {
                        if (item.virtualPrice > 0) {
                            return item;
                        }
                    });
                    return productDiscounts;
                }
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }
    async findProductByCategoryName(categoryName, take, step, req) {
        try {
            const products = await ProductRepository.findProductByCategoryName(categoryName, take, step, req);
            if (products) {
                if (req.body.options.sort == null) {
                    return products;
                }
                if (req.body.options.sort == 'desc') {
                    const sortedProducts = products.sort((a, b) => {
                        return b.price - a.price; // Sắp xếp giảm dần
                    });
                    return sortedProducts;
                }
                if (req.body.options.sort == 'asc') {
                    const sortedProducts = products.sort((a, b) => {
                        return a.price - b.price; // Sắp xếp tăng dần
                    });
                    return sortedProducts;
                }
                if (req.body.options.sort == 'discount') {
                    const productDiscounts = products.map((item) => {
                        if (item.virtualPrice > 0) {
                            return item;
                        }
                    });
                    return productDiscounts;
                }
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }
    async getProductById(productId) {
        try {
            const product = await ProductRepository.find(productId);
            if (!product) {
                return 'Product not found';
            }

            const type = await TypeRepository.find(product.typeId);

            const color = await ColorRepository.find(product.colorId);

            const styles = await Promise.all(product.styleIds.map((styleId) => StylesRepository.find(styleId)));

            return {
                ...product,
                typeName: type ? type.name : null,
                colorName: color ? color.name : null,
                colorCode: color ? color.colorCode : null,
                styleNames: styles.map((style) => (style ? style.name : null)),
            };
        } catch (e) {
            console.log(e.message);
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
    async saveProduct(req) {
        try {
            const product = await ProductRepository.saveUpload(req);

            return {
                message: 'Success',
                product: product,
            };
        } catch (e) {
            console.log(e.message);
            return {
                message: 'Fail',
                product: null,
            };
        }
    }
}
export default new ProductService();
