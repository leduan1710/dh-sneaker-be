import CategoryRepository from '../repositories/CategoryRepository.js';

class CategoryService {
    async getCategory(categoryId) {
        try {
            const category = await CategoryRepository.find(categoryId);
            return category;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
    async getAllCategories() {
        try {
            const categories = await CategoryRepository.findAll();
            return categories;
        } catch (e) {
            console.log(e.message);
            return 'Fail';
        }
    }
}
export default new CategoryService();
