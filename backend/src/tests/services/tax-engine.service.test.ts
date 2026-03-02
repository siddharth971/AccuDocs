import { taxEngineService } from '../../services/tax-engine.service';
import { Invoice } from '../../models';

describe('TaxEngineService - GSTService equivalent', () => {
  describe('calculateGst', () => {
    it('should calculate GST correctly for same state (CGST + SGST)', () => {
      const result = taxEngineService.calculateGst(1000, 18, 'KA', 'KA');
      expect(result.cgstAmount).toBe(90);
      expect(result.sgstAmount).toBe(90);
      expect(result.igstAmount).toBe(0);
      expect(result.totalTax).toBe(180);
      expect(result.grandTotal).toBe(1180);
      expect(result.isSameState).toBe(true);
    });

    it('should calculate GST correctly for different states (IGST)', () => {
      const result = taxEngineService.calculateGst(1000, 18, 'MH', 'KA');
      expect(result.cgstAmount).toBe(0);
      expect(result.sgstAmount).toBe(0);
      expect(result.igstAmount).toBe(180);
      expect(result.totalTax).toBe(180);
      expect(result.grandTotal).toBe(1180);
      expect(result.isSameState).toBe(false);
    });

    it('should handle Reverse Charge Mechanism (0% GST for CA)', () => {
      const result = taxEngineService.calculateGst(1000, 18, 'KA', 'KA', true);
      expect(result.cgstAmount).toBe(0);
      expect(result.sgstAmount).toBe(0);
      expect(result.igstAmount).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.grandTotal).toBe(1000); // Only subtotal
      expect(result.isSameState).toBe(true);
    });

    it('should handle decimal rounding correctly', () => {
      const result = taxEngineService.calculateGst(1000.55, 18, 'KA', 'KA');
      expect(result.cgstAmount).toBe(90.05); // 1000.55 * 0.09 = 90.0495 -> 90.05
      expect(result.sgstAmount).toBe(90.05);
      expect(result.igstAmount).toBe(0);
      expect(result.totalTax).toBe(180.1); // 90.05 + 90.05
      expect(result.grandTotal).toBe(1180.65); // 1000.55 + 180.1
    });
  });

  describe('getDefaultGstSlabForService', () => {
    it('should return 18% for standard services', () => {
      expect(taxEngineService.getDefaultGstSlabForService('AUDIT')).toBe(18);
      expect(taxEngineService.getDefaultGstSlabForService('TAX_PLANNING')).toBe(18);
    });

    it('should return 5% for PROJECT_REPORT exceptions', () => {
      expect(taxEngineService.getDefaultGstSlabForService('PROJECT_REPORT')).toBe(5);
    });

    it('should default to 18% for unknown services', () => {
      expect(taxEngineService.getDefaultGstSlabForService('UNKNOWN_RANDOM')).toBe(18);
    });
  });

  describe('calculateCreditNoteTaxImpact', () => {
    it('should calculate proportional tax reduction for a credit note', () => {
      const mockedInvoice = {
        totalTax: 180,
        grandTotal: 1180,
        outstandingAmount: 1180,
        isSameState: true
      } as Invoice;

      const result = taxEngineService.calculateCreditNoteTaxImpact(mockedInvoice, 590); // exact half credit
      expect(result.taxReduction).toBe(90);
      expect(result.cgstReduction).toBe(45);
      expect(result.sgstReduction).toBe(45);
      expect(result.igstReduction).toBe(0);
    });

    it('should throw error if credit amount exceeds outstanding', () => {
      const mockedInvoice = {
        totalTax: 180,
        grandTotal: 1180,
        outstandingAmount: 100, // Very low outstanding
        isSameState: true
      } as Invoice;

      expect(() => {
        taxEngineService.calculateCreditNoteTaxImpact(mockedInvoice, 590);
      }).toThrow();
    });
  });
});
