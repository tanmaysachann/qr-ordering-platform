import { prisma } from "@/backend/lib/db";
import type { PaymentStatus, Prisma } from "@/generated/prisma";

export const paymentRepository = {
  async createPayment(data: {
    orderId: string;
    amountPaise: number;
    merchantTxnId: string;
  }) {
    return prisma.payment.create({ data });
  },

  async findByMerchantTxnId(merchantTxnId: string) {
    return prisma.payment.findUnique({
      where: { merchantTxnId },
      include: { order: true },
    });
  },

  async updatePaymentStatus(
    merchantTxnId: string,
    data: {
      status: PaymentStatus;
      phonepeTxnId?: string;
      paymentMethod?: string;
      webhookPayload?: Prisma.InputJsonValue;
      paidAt?: Date;
    }
  ) {
    return prisma.payment.update({
      where: { merchantTxnId },
      data,
    });
  },

  async getPaymentsForOrder(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  },
};
