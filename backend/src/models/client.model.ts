import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../config/database.config';

export type ClientStatus = 'active' | 'inactive' | 'suspended';

export interface ClientAttributes {
  id: string;
  organizationId?: string;
  primaryBranchId?: string;
  code: string;
  name: string;
  userId?: string;
  clientType?: string;
  gstin?: string;
  pan?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditLimit?: number;
  paymentTermsDays?: number;
  preferredPaymentMethod?: string;
  whatsappNumber?: string;
  isGstRegistered?: boolean;
  reverseChargeApplicable?: boolean;
  notes?: string;
  status: ClientStatus;
  metadata?: object;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ClientCreationAttributes extends Optional<ClientAttributes, 'id' | 'metadata' | 'status' | 'userId' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  declare public id: string;
  declare public organizationId?: string;
  declare public primaryBranchId?: string;
  declare public code: string;
  declare public name: string;
  declare public userId?: string;
  declare public clientType?: string;
  declare public gstin?: string;
  declare public pan?: string;
  declare public contactPerson?: string;
  declare public contactPhone?: string;
  declare public contactEmail?: string;
  declare public billingAddress?: string;
  declare public shippingAddress?: string;
  declare public creditLimit?: number;
  declare public paymentTermsDays?: number;
  declare public preferredPaymentMethod?: string;
  declare public whatsappNumber?: string;
  declare public isGstRegistered?: boolean;
  declare public reverseChargeApplicable?: boolean;
  declare public notes?: string;

  declare public status: ClientStatus;
  declare public metadata?: object;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;

  // Associations
  declare public readonly user?: any;
  declare public readonly organization?: any;
  declare public readonly primaryBranch?: any;
  declare public readonly years?: any[];
  declare public readonly invoices?: any[];
}

Client.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
      field: 'organization_id',
    },
    primaryBranchId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id',
      },
      field: 'primary_branch_id',
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Unnamed Client',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'user_id',
    },
    clientType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'client_type', // INDIVIDUAL/PARTNERSHIP/PRIVATE_LIMITED/LLP/etc
    },
    gstin: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    pan: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    contactPerson: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'contact_person',
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'contact_phone',
    },
    contactEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'contact_email',
      validate: {
        isEmail: true,
      }
    },
    billingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'billing_address',
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'shipping_address',
    },
    creditLimit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'credit_limit',
    },
    paymentTermsDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
      field: 'payment_terms_days',
    },
    preferredPaymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'preferred_payment_method',
    },
    whatsappNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'whatsapp_number',
    },
    isGstRegistered: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'is_gst_registered',
      defaultValue: false,
    },
    reverseChargeApplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'reverse_charge_applicable',
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'clients',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['code'], unique: true, where: { deleted_at: null } },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['metadata'], using: 'gin' }, // GIN index for JSONB
      { fields: ['organization_id', 'pan'], unique: true, where: { deleted_at: null, pan: { [Op.ne]: null } } },
      { fields: ['gstin'], unique: true, where: { deleted_at: null, gstin: { [Op.ne]: null } } },
      { fields: ['organization_id', 'status'] },
    ],
  }
);
