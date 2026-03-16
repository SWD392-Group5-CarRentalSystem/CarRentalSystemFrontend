import axiosInstance from './axiosConfig';

export const paymentService = {
  /**
   * Create VNPay payment URL for deposit
   * @param bookingId  Booking _id from DB
   * @param depositAmount  Amount in VND (e.g. 1500000)
   * @returns { paymentUrl: string }
   */
  createVnpayUrl: async (bookingId, depositAmount) => {
    return await axiosInstance.post('/payment/vnpay/create-url', {
      bookingId,
      depositAmount: Number(depositAmount),
    });
  },

  /**
   * Create VNPay payment URL for remaining amount (after deposit deducted)
   * @param bookingId  Booking _id from DB
   * @param remainingAmount  Số tiền còn lại sau khi trừ cọc (VND)
   * @returns { paymentUrl: string }
   */
  createRemainingPaymentUrl: async (bookingId, remainingAmount, role = 'driver') => {
    return await axiosInstance.post('/payment/vnpay/create-remaining-url', {
      bookingId,
      remainingAmount: Number(remainingAmount),
      role,
    });
  },
};
