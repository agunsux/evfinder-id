/**
 * plans.test.js — Unit tests for PLANS configuration
 *
 * Run with: node --experimental-vm-modules node_modules/.bin/jest
 * Or: npm test
 */

import { describe, it, expect } from '@jest/globals';
import { PLANS } from '../lib/plans.js';

describe('PLANS', () => {
  it('should export PLANS object', () => {
    expect(PLANS).toBeDefined();
    expect(typeof PLANS).toBe('object');
  });

  it('should have FREE plan', () => {
    expect(PLANS.FREE).toBeDefined();
    expect(PLANS.FREE.id).toBe('free');
    expect(PLANS.FREE.price).toBe(0);
    expect(PLANS.FREE.credits).toBe(10000);
    expect(PLANS.FREE.type).toBe('subscription');
    expect(PLANS.FREE.tier).toBe('FREE');
  });

  it('should have STARTER plan', () => {
    expect(PLANS.STARTER).toBeDefined();
    expect(PLANS.STARTER.id).toBe('starter');
    expect(PLANS.STARTER.price).toBe(19000);
    expect(PLANS.STARTER.type).toBe('topup');
  });

  it('should have KREATOR plan', () => {
    expect(PLANS.KREATOR).toBeDefined();
    expect(PLANS.KREATOR.price).toBe(49000);
    expect(PLANS.KREATOR.yearlyPrice).toBe(490000);
    expect(PLANS.KREATOR.credits).toBe(150000);
    expect(PLANS.KREATOR.isPopular).toBe(true);
  });

  it('should have PRODUKTIF plan', () => {
    expect(PLANS.PRODUKTIF).toBeDefined();
    expect(PLANS.PRODUKTIF.price).toBe(99000);
    expect(PLANS.PRODUKTIF.credits).toBe(400000);
  });

  it('should have BISNIS plan', () => {
    expect(PLANS.BISNIS).toBeDefined();
    expect(PLANS.BISNIS.price).toBe(249000);
    expect(PLANS.BISNIS.credits).toBe(1500000);
  });

  it('should have TOPUP_RECEH plan', () => {
    expect(PLANS.TOPUP_RECEH).toBeDefined();
    expect(PLANS.TOPUP_RECEH.price).toBe(25000);
    expect(PLANS.TOPUP_RECEH.credits).toBe(60000);
    expect(PLANS.TOPUP_RECEH.type).toBe('topup');
  });

  it('should have TOPUP_AMAN plan', () => {
    expect(PLANS.TOPUP_AMAN).toBeDefined();
    expect(PLANS.TOPUP_AMAN.price).toBe(75000);
    expect(PLANS.TOPUP_AMAN.credits).toBe(200000);
  });

  it('should have TOPUP_DARURAT plan', () => {
    expect(PLANS.TOPUP_DARURAT).toBeDefined();
    expect(PLANS.TOPUP_DARURAT.price).toBe(150000);
    expect(PLANS.TOPUP_DARURAT.credits).toBe(500000);
  });

  it('all plans should have required fields', () => {
    Object.entries(PLANS).forEach(([key, plan]) => {
      expect(plan.id).toBeDefined();
      expect(plan.name).toBeDefined();
      expect(plan.price).toBeGreaterThanOrEqual(0);
      expect(plan.credits).toBeGreaterThan(0);
      expect(plan.type).toBeDefined();
    });
  });

  it('credit-to-price ratio should be sensible', () => {
    // TOPUP plans: credits should cost less than Rp1/credit
    const topupPlans = [PLANS.TOPUP_RECEH, PLANS.TOPUP_AMAN, PLANS.TOPUP_DARURAT];
    topupPlans.forEach((plan) => {
      const ratio = plan.credits / plan.price;
      expect(ratio).toBeGreaterThan(1); // More credits than price in rupiah
    });
  });

  it('yearly plans should be cheaper than 12x monthly', () => {
    [PLANS.KREATOR, PLANS.PRODUKTIF, PLANS.BISNIS].forEach((plan) => {
      if (plan.yearlyPrice) {
        expect(plan.yearlyPrice).toBeLessThan(plan.price * 12);
      }
    });
  });
});
