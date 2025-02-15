import axios from 'axios';
import { ReqNotification, ReqWalletNew } from '../../controllers/socket/EmitSocket.js';
import NotificationRepository from '../../repositories/NotificationRepository.js';
import RequestWithdrawRepository from '../../repositories/RequestWithdrawRepository.js';
import TransactionRepository from '../../repositories/TransactionRepository.js';
import UserRepository from '../../repositories/UserRepository.js';
import WalletRepository from '../../repositories/WalletRepository.js';

class AdminService {
    async acceptWithdraw(req) {
        try {
            const requestWithdrawId = req.params.requestWithdrawId;
            const withdraw = await RequestWithdrawRepository.find(requestWithdrawId);
            if (!withdraw) {
                return 'Fail';
            }
            const wallet_user = await WalletRepository.db.findFirst({ where: { userId: withdraw.userId } });
            if (!wallet_user) {
                return 'Fail';
            }
            if (wallet_user.balance < withdraw.value) {
                return 'Fail';
            }
            const new_transaction = await TransactionRepository.db.create({
                data: {
                    value: withdraw.value,
                    describe: 'withdraw',
                    from: wallet_user.id,
                    walletId: wallet_user.id,
                },
            });
            if (!new_transaction) {
                return 'Fail';
            }
            // const new_wallet_user = await WalletRepository.update(wallet_user.id, {
            //     balance: parseFloat(wallet_user.balance - parseFloat(withdraw.value)),
            // });
            // if (!new_wallet_user) {
            //     return 'Fail';
            // }
            const new_withdraw = await RequestWithdrawRepository.update(requestWithdrawId, { status: 'DONE' });
            if (!new_withdraw) {
                return 'Fail';
            }

            const new_notification = await NotificationRepository.db.create({
                data: {
                    userId: withdraw.userId,
                    image: 'WithdrawSuccess',
                    status: 'UNREAD',
                    isCTV: false,
                    link: '/user/wallet',
                    describe: `Rút tiền thành công, số tiền rút ${withdraw.value}`,
                },
            });
            if (new_notification) {
                ReqNotification(withdraw.userId);
                ReqWalletNew(withdraw.userId);
                return true;
            } else {
                return 'Fail';
            }
        } catch (e) {
            console.error(e.message);
            return 'Fail';
        }
    }

    async cancelWithdraw(req) {
        try {
            const requestWithdrawId = req.params.requestWithdrawId;
            const withdraw = await RequestWithdrawRepository.find(requestWithdrawId);
            if (!withdraw) {
                return 'Fail';
            }
            const new_withdraw = await RequestWithdrawRepository.update(requestWithdrawId, { status: 'CANCEL' });
            if (!new_withdraw) {
                return 'Fail';
            }
            const new_notification = await NotificationRepository.db.create({
                data: {
                    userId: withdraw.userId,
                    image: 'WithdrawCancel',
                    status: 'UNREAD',
                    isCTV: false,
                    link: '/user/wallet',
                    describe: `Yêu cầu rút tiền bị từ chối, số tiền rút ${withdraw.value}`,
                },
            });
            //update balance
            const wallet_user = await WalletRepository.db.findFirst({ where: { userId: withdraw.userId } });
            if (!wallet_user) {
                return 'Fail';
            }
            const new_wallet_user = await WalletRepository.update(wallet_user.id, {
                balance: parseFloat(wallet_user.balance + parseFloat(withdraw.value)),
            });
            if (!new_wallet_user) {
                return 'Fail';
            }
            //
            if (new_notification) {
                ReqNotification(withdraw.userId);
                ReqWalletNew(withdraw.userId);
                return true;
            } else {
                return 'Fail';
            }
        } catch {
            return 'Fail';
        }
    }
}
export default new AdminService();
