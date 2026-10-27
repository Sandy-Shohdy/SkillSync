import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface CardDetails {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}

export interface ChargeResult {
  reference: string;
  last4: string;
}

export class PaymentDeclinedError extends Error {}

// Swap MockPaymentProvider for a real implementation (Stripe, Paymob, Klarna...)
// by binding a different class to this token in PaymentsModule.
export abstract class PaymentProvider {
  abstract readonly name: string;
  abstract charge(
    amount: number,
    currency: string,
    card: CardDetails,
    description: string,
  ): Promise<ChargeResult>;
  abstract refund(reference: string, amount: number): Promise<void>;
}

// Test cards that are declined, mirroring Stripe's test numbers.
const DECLINED_CARDS: Record<string, string> = {
  '4000000000000002': 'Your card was declined',
  '4000000000009995': 'Your card has insufficient funds',
};

function passesLuhn(number: string) {
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    let digit = Number(number[number.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// Simulated provider: no money moves. Use 4242 4242 4242 4242 to succeed.
@Injectable()
export class MockPaymentProvider extends PaymentProvider {
  readonly name = 'mock';

  async charge(
    _amount: number,
    _currency: string,
    card: CardDetails,
  ): Promise<ChargeResult> {
    if (!passesLuhn(card.number)) {
      throw new PaymentDeclinedError('Your card number is invalid');
    }
    const now = new Date();
    const expiresAfter = new Date(card.expYear, card.expMonth, 1);
    if (expiresAfter <= now) {
      throw new PaymentDeclinedError('Your card has expired');
    }
    const declined = DECLINED_CARDS[card.number];
    if (declined) {
      throw new PaymentDeclinedError(declined);
    }
    return { reference: `mock_ch_${randomUUID()}`, last4: card.number.slice(-4) };
  }

  async refund(): Promise<void> {
    // Nothing to do for simulated charges.
  }
}
