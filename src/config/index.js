import AuthController from '../controllers/auth/AuthController.js';
import AddressController from '../controllers/user/AddressController.js';
import GuestController from '../controllers/guest/GuestController.js';
import ProvinceController from '../controllers/ProvinceController.js';
import UserController from '../controllers/user/UserController.js';
import PaymentController from '../controllers/payment/PaymentController.js';
import CRUDController from '../controllers/admin/data/CRUDController.js';
import ShopCRUDController from '../controllers/shop/ShopCRUDController.js';
import ShopMessageController from '../controllers/shop/ShopMessageController.js';
export function initApplication(app) {
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };

    initRoutes(app);
    //Scheduled.initJobs();
}
export function initRoutes(app) {
    ShopCRUDController.initRoutes(app);
    CRUDController.initRoutes(app);
    AuthController.initRoutes(app);
    UserController.initRoutes(app);
    GuestController.initRoutes(app);
    ProvinceController.initRoutes(app);
    AddressController.initRoutes(app);
    PaymentController.initRoutes(app);
    ShopMessageController.initRoutes(app);
}
