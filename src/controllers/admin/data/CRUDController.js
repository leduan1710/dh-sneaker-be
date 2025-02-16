import httpStatus from 'http-status';
import { isAuth } from '../../../middleware/auth.middleware.js';
import { publicUploadFile } from '../../../middleware/upload.middleware.js';
import GetDataService from '../../../services/admin/data/GetDataService.js';
import AuthService from '../../../services/auth/AuthService.js';

class CRUDController {
    initRoutes(app) {
        app.post('/admin/add/category', this.addCategory);
        app.get('/admin/get/categories', this.findAllCategories);

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
