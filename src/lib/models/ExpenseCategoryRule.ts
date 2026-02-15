import mongoose from "mongoose";

export interface IExpenseCategoryRule {
  business: mongoose.Types.ObjectId;
  category: string;
  keywords: string[];
  priority: number; // higher = checked first
  isDefault: boolean; // system-provided vs user-created
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseCategoryRuleSchema = new mongoose.Schema<IExpenseCategoryRule>(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    category: { type: String, required: true, trim: true },
    keywords: [{ type: String, trim: true, lowercase: true }],
    priority: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ExpenseCategoryRuleSchema.index({ business: 1, category: 1 });
ExpenseCategoryRuleSchema.index({ business: 1, isDefault: 1 });

const ExpenseCategoryRule =
  mongoose.models.ExpenseCategoryRule ||
  mongoose.model<IExpenseCategoryRule>(
    "ExpenseCategoryRule",
    ExpenseCategoryRuleSchema,
  );

export default ExpenseCategoryRule;

// ─── Default keyword rules (Phase 1) ────────────────────────────────
export const DEFAULT_CATEGORY_RULES: {
  category: string;
  keywords: string[];
}[] = [
  {
    category: "Utilities",
    keywords: [
      "electricity",
      "energy",
      "electric",
      "power",
      "electricidad",
      "energía",
      "energia",
      "luz",
      "water",
      "plumbing",
      "agua",
      "plomería",
      "encanamento",
      "internet",
      "wifi",
      "phone",
      "telephone",
      "teléfono",
      "telefone",
      "cable",
      "gas",
    ],
  },
  {
    category: "Payroll",
    keywords: [
      "salary",
      "wage",
      "employee payment",
      "payroll",
      "salario",
      "sueldo",
      "nómina",
      "nomina",
      "empleado",
      "pago empleado",
      "folha",
      "pagamento funcionário",
      "honorarios",
      "honorário",
    ],
  },
  {
    category: "Rent",
    keywords: [
      "rent",
      "lease",
      "alquiler",
      "arrendamiento",
      "aluguel",
      "locação",
      "local",
    ],
  },
  {
    category: "Materials",
    keywords: [
      "supply",
      "material",
      "raw material",
      "supplies",
      "materiales",
      "materia prima",
      "insumo",
      "insumos",
      "suministro",
      "materiais",
      "matéria prima",
    ],
  },
  {
    category: "Infrastructure",
    keywords: [
      "maintenance",
      "repair",
      "fix",
      "mantenimiento",
      "reparación",
      "reparacion",
      "arreglo",
      "manutenção",
      "reparo",
      "conserto",
    ],
  },
];
