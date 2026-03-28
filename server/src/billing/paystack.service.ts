import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { createHmac } from 'crypto';

interface PaystackTransactionInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackCustomerCreateResponse {
  status: boolean;
  message: string;
  data?: {
    customer_code: string;
    id: number;
  };
}

export interface PaystackTransactionVerifyResponse {
  status: string;
  amount: number;
  currency: string;
  customer_id: number;
  paid_at?: string;
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    should_remember_customer: boolean;
  };
  metadata?: {
    company_id: string;
    plan_id: string;
    plan_name: string;
    billing_cycle: string;
  };
}

@Injectable()
export class PaystackService {
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const public_ = this.configService.get<string>('PAYSTACK_PUBLIC_KEY');

    if (!secret || !public_) {
      throw new Error('Paystack keys not configured in environment variables');
    }

    this.secretKey = secret;
    this.publicKey = public_;
  }

  /**
   * Initialize a transaction for plan upgrade
   * Returns the authorization URL for checkout
   */
  async initializeCheckout(
    email: string,
    amount: number, // Amount in kobo (smallest currency unit)
    metadata: {
      company_id: string;
      plan_id: string;
      plan_name: string;
      billing_cycle: string;
    },
  ): Promise<{
    checkout_url: string;
    reference: string;
    access_code: string;
  }> {
    try {
      const response = await axios.post<PaystackTransactionInitResponse>(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount,
          metadata,
          callback_url: `${this.configService.get('APP_URL')}/dashboard/billing/verify?reference=`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (
        !response.data.status ||
        !response.data.data ||
        !response.data.data.authorization_url
      ) {
        throw new Error(
          response.data.message || 'Failed to initialize checkout',
        );
      }

      return {
        checkout_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
        access_code: response.data.data.access_code,
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      throw new HttpException(
        `Failed to initialize payment: ${errorMessage}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  /**
   * Verify a transaction using reference
   */
  async verifyTransaction(
    reference: string,
  ): Promise<
    PaystackTransactionVerifyResponse & { transaction_status: string }
  > {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (
        !response.data ||
        typeof response.data !== 'object' ||
        !('status' in response.data)
      ) {
        throw new Error('Invalid response from Paystack');
      }

      const data = response.data as Record<string, unknown>;
      // Check if the API response itself was successful
      if (data.status !== true) {
        throw new Error('Transaction verification failed from Paystack API');
      }

      if (!('data' in data) || !data.data) {
        throw new Error('No transaction data returned');
      }

      const txData = data.data as Record<string, unknown>;
      // Check the transaction status - should be 'success' for successful payments
      const txStatus = txData.status as string;
      if (txStatus !== 'success') {
        throw new Error(`Transaction status is ${txStatus}, not success`);
      }

      return {
        ...(txData as unknown as PaystackTransactionVerifyResponse),
        transaction_status: txStatus,
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      throw new HttpException(
        `Failed to verify transaction: ${errorMessage}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Initialize authorization for payment method setup
   * Returns authorization URL for user to authorize payment
   */
  async initializeAuthorization(
    email: string,
    plan_name: string,
    company_id: string,
  ): Promise<{
    authorization_url: string;
    reference: string;
    access_code: string;
  }> {
    try {
      // Create a minimal transaction for authorization setup
      const response = await axios.post<PaystackTransactionInitResponse>(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount: 50000, // ₦500 minimum for authorization
          plan: plan_name,
          metadata: {
            action: 'authorize_payment_method',
            company_id,
          },
          callback_url: `${this.configService.get('APP_URL')}/dashboard/billing/payment-method-callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (!response.data.status || !response.data.data) {
        throw new Error(
          response.data.message || 'Failed to initialize authorization',
        );
      }

      return {
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
        access_code: response.data.data.access_code,
      };
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      throw new HttpException(
        `Failed to initialize authorization: ${errorMessage}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  /**
   * Create a customer for recurring payments
   */
  async createCustomer(
    email: string,
    first_name: string,
    last_name: string,
  ): Promise<{
    customer_code: string;
    id: number;
  }> {
    try {
      const response = await axios.post<PaystackCustomerCreateResponse>(
        `${this.baseUrl}/customer`,
        {
          email,
          first_name,
          last_name,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (!response.data.status || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create customer');
      }

      return {
        customer_code: response.data.data.customer_code,
        id: response.data.data.id,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      // Customer might already exist
      if (axiosError.response?.status === 400) {
        const responseData = axiosError.response.data as Record<
          string,
          unknown
        >;
        if (
          typeof responseData?.message === 'string' &&
          responseData.message.includes('exist')
        ) {
          return { customer_code: '', id: 0 };
        }
      }
      const errorMessage = this.extractErrorMessage(error);
      throw new HttpException(
        `Failed to create customer: ${errorMessage}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get public key for client-side integration
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Verify webhook signature from Paystack
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    const hash = createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }

  /**
   * Helper to extract error messages from various error types
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      if (
        typeof error.response?.data === 'object' &&
        error.response?.data !== null
      ) {
        const data = error.response.data as Record<string, unknown>;
        if (typeof data.message === 'string') {
          return data.message;
        }
      }
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}
