import httpStatus from 'http-status';
import { isAuth } from '../../middleware/auth.middleware.js';
import AddressService from '../../services/user/AddressService.js';
import AddressRepository from '../../repositories/AddressRepository.js';

class AddressController {
    initRoutes(app) {
        app.post('/user/address/save', isAuth, this.saveAddress);
        app.get('/user/address/get', isAuth, this.getAddress);
        app.get('/user/address/get-id/:id', isAuth, this.getAddressById);
        app.post('/user/address/remove/:id', isAuth, this.removeAddress);
        app.post('/user/address/update/:id', isAuth, this.updateAddress);
    }
    async getAddressById(req, res) {
        try {
            const addressId = req.params.id;
            const permissionAccess = req.user.addressIdList.some((id) => id === addressId);
            if (permissionAccess) {
                const resAddress = await AddressRepository.find(addressId);
                return res.status(httpStatus.OK).json({ message: 'Sucess', Address: resAddress });
            } else {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async updateAddress(req, res) {
        try {
            const addressId = req.params.id;
            const resUpdate = await AddressService.update(req, addressId);
            if (resUpdate == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', Address: resUpdate });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async removeAddress(req, res) {
        try {
            const addressId = req.params.id;
            const resRemove = await AddressService.remove(req, addressId);
            if (resRemove == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.NO_CONTENT).json({ message: 'Success' });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async getAddress(req, res) {
        try {
            const resAddress = await AddressService.get(req);
            if (resAddress == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', listAddress: resAddress });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
    async saveAddress(req, res) {
        try {
            const resAddress = await AddressService.save(req);
            if (resAddress == 'Fail') {
                return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
            } else {
                return res.status(httpStatus.OK).json({ message: 'Success', Address: resAddress });
            }
        } catch {
            return res.status(httpStatus.BAD_GATEWAY).json({ message: 'Fail' });
        }
    }
}
export default new AddressController();
