import { Invoice } from '../models';

export interface GstCalculationResult {
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  isSameState: boolean;
}

export const taxEngineService = {
  /**
   * Calculate GST components based on subtotal, slab, and state match
   */
  calculateGst(
    subtotal: number,
    gstSlab: number,
    clientStateCode: string,
    caStateCode: string,
    isReverseCharge: boolean = false
  ): GstCalculationResult {
    // Determine tax type based on state match
    const isSameState = clientStateCode.trim().toLowerCase() === caStateCode.trim().toLowerCase();

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isReverseCharge) {
      // For Reverse Charge Mechanism, CA charges 0% GST
      // Client assumes responsibility for tax
      return {
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTax: 0,
        grandTotal: Math.round(subtotal * 100) / 100,
        isSameState
      };
    }

    if (isSameState) {
      // Same state: Split equally (CGST + SGST)
      const halfRate = gstSlab / 2;
      cgst = subtotal * (halfRate / 100);
      sgst = subtotal * (halfRate / 100);
      igst = 0;
    } else {
      // Different state: Single IGST
      cgst = 0;
      sgst = 0;
      igst = subtotal * (gstSlab / 100);
    }

    const totalTax = cgst + sgst + igst;
    const grandTotal = subtotal + totalTax;

    return {
      cgstAmount: Math.round(cgst * 100) / 100, // Round to 2 decimal places
      sgstAmount: Math.round(sgst * 100) / 100,
      igstAmount: Math.round(igst * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      isSameState
    };
  },

  /**
   * Get default GST Slab for CA Services (usually 18%)
   */
  getDefaultGstSlabForService(serviceCategory: string): number {
    const defaultSlabMap: Record<string, number> = {
      'AUDIT': 18,
      'COMPLIANCE': 18,
      'TAX_PLANNING': 18,
      'GST_COMPLIANCE': 18,
      'PAYROLL': 18,
      'BOOKKEEPING': 18,
      'CONSULTING': 18,
      'REGISTRATION': 18,
      'PROJECT_REPORT': 5 // Example exception
    };

    const category = serviceCategory.toUpperCase();
    return defaultSlabMap[category] !== undefined ? defaultSlabMap[category] : 18;
  },

  /**
   * Get standard SAC Code for CA Services
   */
  getDefaultSacCode(): string {
    return '998311'; // Other professional, technical and business services
  },

  /**
   * Calculate exact tax impact of a credit note on an invoice
   */
  calculateCreditNoteTaxImpact(invoice: Invoice, creditAmount: number) {
    if (Number(creditAmount) > Number(invoice.outstandingAmount)) {
      throw new Error(`Credit amount ${creditAmount} exceeds outstanding ${invoice.outstandingAmount}`);
    }

    // Calculate proportional tax reduction
    const taxRate = Number(invoice.totalTax) / Number(invoice.grandTotal);
    const taxReduction = creditAmount * taxRate;

    let cgstReduction = 0;
    let sgstReduction = 0;
    let igstReduction = 0;

    if (invoice.isSameState) {
      cgstReduction = taxReduction / 2;
      sgstReduction = taxReduction / 2;
    } else {
      igstReduction = taxReduction;
    }

    return {
      taxReduction: Math.round(taxReduction * 100) / 100,
      cgstReduction: Math.round(cgstReduction * 100) / 100,
      sgstReduction: Math.round(sgstReduction * 100) / 100,
      igstReduction: Math.round(igstReduction * 100) / 100
    };
  }
};
