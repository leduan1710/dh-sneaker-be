import BaseRepository from './BaseRepository.js';
import CategoryRepository from './CategoryRepository.js';
import DiscountRepository from './DiscountRepository.js';

class ProductRepository extends BaseRepository {
    modelName = 'Product';

    constructor() {
        super();
        this.db = this.prisma.product;
        this.dbCategory = this.prisma.category;
        this.dbProductDetail = this.prisma.productDetail;
        this.dbDiscount = this.prisma.discount;
        this.defaultSelected = {
            id: true,
            name: true,
            active: true,
            materialId: true,
            originId: true,
            styleId: true,
            brandId: true,
            materialOrther: true,
            originOrther: true,
            styleOrther: true,
            brandOrther: true,
            describe: true,
            price: true,
            image: true,
            userFavoriteIdList: true,
            productCIdList: true,
            reviewIdList: true,
            //{"color":"[red,green,blue]","size":"[M,L,XL]"}
            options: true,
            categoryId: true,
            shopId: true,
            activeByShop: true,
        };
    }
    async findAllProductByShop(shopId) {
        const products = await this.db.findMany({
            where: {
                shopId: shopId,
                active: true,
                activeByShop: true,
            },
            select: {
                id: true,
                name: true,
                active: true,
                activeByShop: true,
                materialId: true,
                originId: true,
                styleId: true,
                brandId: true,
                describe: true,
                price: true,
                image: true,
                userFavoriteIdList: true,
                productCIdList: true,
                reviewIdList: true,
                options: true,
                categoryId: true,
                shopId: true,
                percentDiscountTop: true,
                activeByShop: true,
            },
        });
        return products;
    }

    async getSold(products, groupedProductDetails) {
        if (groupedProductDetails && products) {
            products.map((product, index) => {
                const productIndex = groupedProductDetails.findIndex((item) => item.productId === product.id);
                if (productIndex != -1) {
                    product.numberSold = groupedProductDetails[productIndex]._sum.numberSold;
                }
                //
            });
            return products;
        }
    }
    async findById(id) {
        //sold
        const groupedProductDetails = await this.dbProductDetail.groupBy({
            by: ['productId'],
            where: {
                productId: id,
            },
            _sum: {
                numberSold: true,
            },
            orderBy: {
                _sum: {
                    numberSold: 'desc',
                },
            },
        });
        //
        const product = await this.db.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
                active: true,
                materialId: true,
                originId: true,
                styleId: true,
                brandId: true,
                materialOrther: true,
                originOrther: true,
                styleOrther: true,
                brandOrther: true,
                describe: true,
                price: true,
                image: true,
                percentDiscountTop: true,
                userFavoriteIdList: true,
                productCIdList: true,
                reviewIdList: true,
                //{"color":"[red,green,blue]","size":"[M,L,XL]"}
                options: true,
                categoryId: true,
                shopId: true,
                activeByShop: true,
            },
        });
        //
        if (product && groupedProductDetails) {
            if (groupedProductDetails.length > 0) {
                product.numberSold = groupedProductDetails[0]._sum.numberSold;
            }
            return product;
        }
    }
    async findProductByName(name, take) {
        const productByName = await this.db.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
                active: true,
                activeByShop: true,
            },
            select: {
                name: true,
                id: true,
                price: true,
                image: true,
                percentDiscountTop: true,
                activeByShop: true,
                active: true,
            },
            take: take,
        });

        return productByName;
    }

    async findTopProductsByShop(shopId, listProductsId) {
        //number sold
        const groupedProductDetails = await this.dbProductDetail.groupBy({
            by: ['productId'],
            where: {
                productId: {
                    in: listProductsId,
                },
                active: true,
                activeByShop: true,
            },
            _sum: {
                numberSold: true,
            },
            orderBy: {
                _sum: {
                    numberSold: 'desc',
                },
            },
        });

        //products
        const products = await this.db.findMany({
            where: {
                shopId: shopId,
                id: {
                    in: listProductsId,
                },
                active: true,
                activeByShop: true,
            },
            select: {
                id: true,
                name: true,
                active: true,
                materialId: true,
                originId: true,
                styleId: true,
                brandId: true,
                materialOrther: true,
                originOrther: true,
                styleOrther: true,
                brandOrther: true,
                price: true,
                image: true,
                userFavoriteIdList: true,
                percentDiscountTop: true,
                //{"color":"[red,green,blue]","size":"[M,L,XL]"}
                categoryId: true,
                shopId: true,
                activeByShop: true,
            },
        });
        //
        const res = await this.getSold(products, groupedProductDetails);
        return res;
    }

    async findProductSimilar(categoryId, shopId, productId, take) {
        const products = await this.db.findMany({
            where: {
                shopId: shopId,
                categoryId: categoryId,
                id: {
                    not: productId, //this is !=
                },
                active: true,
                activeByShop: true,
            },
            take: take,
            select: {
                id: true,
                name: true,
                active: true,
                materialId: true,
                originId: true,
                styleId: true,
                brandId: true,
                materialOrther: true,
                originOrther: true,
                styleOrther: true,
                brandOrther: true,
                price: true,
                image: true,
                userFavoriteIdList: true,
                percentDiscountTop: true,
                //{"color":"[red,green,blue]","size":"[M,L,XL]"}
                categoryId: true,
                shopId: true,
                activeByShop: true,
            },
        });
        const productIds = products.map((item) => item.id);
        /////////////////
        //number sold
        const groupedProductDetails = await this.dbProductDetail.groupBy({
            by: ['productId'],
            where: {
                productId: {
                    in: productIds,
                },
                active: true,
                activeByShop: true,
            },
            _sum: {
                numberSold: true,
            },
            orderBy: {
                _sum: {
                    numberSold: 'desc',
                },
            },
        });
        const res = await this.getSold(products, groupedProductDetails);
        return res;
    }
    async findProductNew() {
        //find product
        const products = await this.db.findMany({
            where: {
                active: true,
                activeByShop: true,
            },
            orderBy: {
                createDate: 'desc',
            },
            select: {
                id: true,
                name: true,
                price: true,
                image: true,
                userFavoriteIdList: true,
                percentDiscountTop: true,
                //{"color":"[red,green,blue]","size":"[M,L,XL]"}
                shopId: true,
                activeByShop: true,
            },
            take: 12,
        });
        const productIds = products.map((item) => item.id);
        const groupedProductDetails = await this.dbProductDetail.groupBy({
            by: ['productId'],
            where: {
                productId: {
                    in: productIds,
                },
                active: true,
                activeByShop: true,
            },
            _sum: {
                numberSold: true,
            },
            orderBy: {
                _sum: {
                    numberSold: 'desc',
                },
            },
        });
        const res = await this.getSold(products, groupedProductDetails);
        return res;
    }
    async findProductTop() {
        //find by numberSold
        const groupedProductDetails = await this.dbProductDetail.groupBy({
            by: ['productId'],
            where: {
                active: true,
                activeByShop: true,
            },
            _sum: {
                numberSold: true,
            },
            orderBy: {
                _sum: {
                    numberSold: 'desc',
                },
            },
            take: 24,
        });
        const productIds = groupedProductDetails.map((item) => item.productId);
        //find product
        const products = await this.db.findMany({
            where: {
                id: {
                    in: productIds,
                },
                active: true,
                activeByShop: true,
            },
            select: {
                id: true,
                name: true,
                price: true,
                image: true,
                userFavoriteIdList: true,
                percentDiscountTop: true,
                //{"color":"[red,green,blue]","size":"[M,L,XL]"}
                shopId: true,
                activeByShop: true,
            },
        });

        const res = await this.getSold(products, groupedProductDetails);
        return res;
    }
    async findProductByShop(shopId, take, step, req) {
        let listProductId = [];
        if (req.body.discount) {
            const productDetail_discount = await this.dbProductDetail.findMany({
                where: {
                    discountId: req.body.discount.id,
                    active: true,
                    activeByShop: true,
                },
            });
            if (productDetail_discount.length > 0) {
                listProductId = productDetail_discount.map((item) => item.productId);
            }
        }
        //product
        const products = await this.db.findMany({
            where: {
                shopId: shopId,
                ...(listProductId.length > 0 ? { id: { in: listProductId } } : {}),
                active: true,
                activeByShop: true,
            },
            select: {
                id: true,
                name: true,
                price: true,
                image: true,
                percentDiscountTop: true,
                userFavoriteIdList: true,
                shopId: true,
                activeByShop: true,
            },
            ...(req.body.options.sort == 'desc' || req.body.options.sort == 'asc' ? {} : { take: parseInt(take) }),
            ...(req.body.options.sort == 'desc' || req.body.options.sort == 'asc' ? {} : { skip: (step - 1) * take }),
        });
        const productIds = products.map((item) => item.id);
        //number sold
        const groupedProductDetails = await this.dbProductDetail.groupBy({
            by: ['productId'],
            where: {
                productId: {
                    in: productIds,
                },
                active: true,
                activeByShop: true,
            },
            _sum: {
                numberSold: true,
            },
            orderBy: {
                _sum: {
                    numberSold: 'desc',
                },
            },
        });

        const res = await this.getSold(products, groupedProductDetails);
        return res;
    }
    async findProductByCategory(categoryId, take, step, req) {
        // // get category child
        const category = await CategoryRepository.find(categoryId);
        //
        let categoryIdClIST = category.categoryIdClIST;
        if (categoryIdClIST.length == 0) {
            categoryIdClIST = [category.id];
        }
        //
        //product
        const products = await this.db.findMany({
            where: {
                categoryId: {
                    in: categoryIdClIST,
                },
                active: true,
                activeByShop: true,

                ...(req.body.options.materialId ? { materialId: req.body.options.materialId } : {}),
                ...(req.body.options.brandId ? { brandId: req.body.options.brandId } : {}),
                ...(req.body.options.styleId ? { styleId: req.body.options.styleId } : {}),
                ...(req.body.options.originId ? { originId: req.body.options.originId } : {}),
            },

            select: {
                id: true,
                name: true,
                // materialId: true,
                // originId: true,
                // styleId: true,
                // brandId: true,
                // materialOrther: true,
                // originOrther: true,
                // styleOrther: true,
                // brandOrther: true,
                price: true,
                image: true,
                percentDiscountTop: true,
                userFavoriteIdList: true,
                shopId: true,
            },
            ...(req.body.options.sort == 'desc' || req.body.options.sort == 'asc' ? {} : { take: parseInt(take) }),
            ...(req.body.options.sort == 'desc' || req.body.options.sort == 'asc' ? {} : { skip: (step - 1) * take }),
        });
        const productIds = products.map((item) => item.id);
        //number sold
        const groupedProductDetails = await this.dbProductDetail.groupBy({
            by: ['productId'],
            where: {
                productId: {
                    in: productIds,
                },
                active: true,
                activeByShop: true,
            },
            _sum: {
                numberSold: true,
            },
            orderBy: {
                _sum: {
                    numberSold: 'desc',
                },
            },
        });

        const res = await this.getSold(products, groupedProductDetails);
        return res;
    }

    async findProductByListId(req) {
        const listProductId = req.body.listProductId;
        const products = await this.db.findMany({
            where: {
                id: {
                    in: listProductId,
                },
                active: true,
                activeByShop: true,
            },

            select: {
                id: true,
                name: true,
                // materialId: true,
                // originId: true,
                // styleId: true,
                // brandId: true,
                // materialOrther: true,
                // originOrther: true,
                // styleOrther: true,
                // brandOrther: true,
                price: true,
                image: true,
                percentDiscountTop: true,
                userFavoriteIdList: true,
                shopId: true,
                activeByShop: true,
            },
        });
        //number sold
        const groupedProductDetails = await this.dbProductDetail.groupBy({
            by: ['productId'],
            where: {
                productId: {
                    in: listProductId,
                },
                active: true,
                activeByShop: true,
            },
            _sum: {
                numberSold: true,
            },
            orderBy: {
                _sum: {
                    numberSold: 'desc',
                },
            },
        });
        const res = await this.getSold(products, groupedProductDetails);
        return res;
    }
}

export default new ProductRepository();
