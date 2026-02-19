"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";

interface Article {
  id: string;
  title: string;
  description: string;
  readTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface CategoryData {
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: Article[];
}

const categoryDataMap: Record<string, CategoryData> = {
  "getting-started": {
    title: "Getting Started",
    description: "First steps to set up your VentaPlus account and start selling",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    articles: [
      { id: "create-account", title: "Create your VentaPlus account", description: "Sign up and configure your business profile in minutes.", readTime: "3 min", difficulty: "beginner" },
      { id: "first-sale", title: "Make your first sale", description: "Learn to process your first transaction through the POS.", readTime: "5 min", difficulty: "beginner" },
      { id: "add-products", title: "Add your first products", description: "Upload your product catalog manually or via import.", readTime: "7 min", difficulty: "beginner" },
      { id: "invite-team", title: "Invite your team members", description: "Set up user roles and permissions for your staff.", readTime: "4 min", difficulty: "beginner" },
      { id: "connect-printer", title: "Connect a receipt printer", description: "Configure thermal printers for receipts and tickets.", readTime: "6 min", difficulty: "intermediate" },
    ],
  },
  "arca-invoicing": {
    title: "ARCA Invoicing",
    description: "Electronic invoicing with ARCA/AFIP compliance",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    articles: [
      { id: "arca-setup", title: "Set up ARCA/AFIP integration", description: "Connect your digital certificate and configure fiscal credentials.", readTime: "10 min", difficulty: "intermediate" },
      { id: "factura-a", title: "Issue Factura A", description: "Step-by-step guide to issue Factura A for registered taxpayers.", readTime: "5 min", difficulty: "beginner" },
      { id: "factura-b", title: "Issue Factura B", description: "How to issue Factura B for final consumers.", readTime: "5 min", difficulty: "beginner" },
      { id: "nota-credito", title: "Issue Credit Notes", description: "Process returns and issue credit notes properly.", readTime: "6 min", difficulty: "intermediate" },
      { id: "cae-troubleshooting", title: "CAE Troubleshooting", description: "Common issues and solutions when requesting CAE from AFIP.", readTime: "8 min", difficulty: "advanced" },
      { id: "certificate-renewal", title: "Certificate Renewal", description: "How to renew your AFIP digital certificate.", readTime: "7 min", difficulty: "intermediate" },
      { id: "fiscal-controller", title: "Fiscal Controller Setup", description: "Configure VentaPlus with approved fiscal controllers.", readTime: "10 min", difficulty: "advanced" },
      { id: "iva-conditions", title: "IVA Conditions & Tax Types", description: "Understanding IVA categories and tax configurations.", readTime: "6 min", difficulty: "intermediate" },
    ],
  },
  "pos-cash-register": {
    title: "POS / Cash Register",
    description: "Master the point of sale interface and cash management",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    articles: [
      { id: "pos-overview", title: "POS Interface Overview", description: "Understand the layout and navigation of the point of sale.", readTime: "5 min", difficulty: "beginner" },
      { id: "quick-sale", title: "Quick Sale Mode", description: "Use quick sale for fast counter transactions.", readTime: "4 min", difficulty: "beginner" },
      { id: "payment-methods", title: "Payment Methods", description: "Configure cash, card, and mixed payment methods.", readTime: "5 min", difficulty: "beginner" },
      { id: "cash-drawer", title: "Cash Drawer Operations", description: "Open shift, close shift, and cash withdrawals.", readTime: "7 min", difficulty: "intermediate" },
      { id: "discounts", title: "Apply Discounts & Promotions", description: "Set up automatic and manual discounts.", readTime: "6 min", difficulty: "intermediate" },
      { id: "barcode-scanning", title: "Barcode Scanning", description: "Use barcode scanners for faster checkout.", readTime: "4 min", difficulty: "beginner" },
      { id: "keyboard-shortcuts", title: "Keyboard Shortcuts", description: "Speed up operations with keyboard shortcuts.", readTime: "3 min", difficulty: "beginner" },
      { id: "receipt-customization", title: "Receipt Customization", description: "Customize receipt templates and print settings.", readTime: "6 min", difficulty: "intermediate" },
      { id: "hold-orders", title: "Hold & Recall Orders", description: "Manage pending orders during busy periods.", readTime: "4 min", difficulty: "intermediate" },
      { id: "returns-refunds", title: "Process Returns & Refunds", description: "Handle product returns and issue refunds.", readTime: "6 min", difficulty: "intermediate" },
      { id: "shift-reports", title: "End-of-Shift Reports", description: "Generate and review daily cash balance reports.", readTime: "5 min", difficulty: "beginner" },
      { id: "multi-terminal", title: "Multi-Terminal Setup", description: "Run multiple POS terminals for your business.", readTime: "8 min", difficulty: "advanced" },
    ],
  },
  "inventory-management": {
    title: "Inventory Management",
    description: "Stock control, categories, and product management",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    articles: [
      { id: "product-catalog", title: "Managing Your Product Catalog", description: "Add, edit, and organize products efficiently.", readTime: "8 min", difficulty: "beginner" },
      { id: "categories", title: "Product Categories", description: "Create and manage product category hierarchies.", readTime: "5 min", difficulty: "beginner" },
      { id: "stock-alerts", title: "Low Stock Alerts", description: "Set up automatic notifications for low stock items.", readTime: "4 min", difficulty: "beginner" },
      { id: "stock-adjustments", title: "Stock Adjustments", description: "Make manual stock corrections and track changes.", readTime: "5 min", difficulty: "intermediate" },
      { id: "bulk-import", title: "Bulk Product Import", description: "Import products in bulk using CSV files.", readTime: "7 min", difficulty: "intermediate" },
      { id: "variants", title: "Product Variants", description: "Manage size, color, and other product variations.", readTime: "6 min", difficulty: "intermediate" },
      { id: "stock-reports", title: "Stock Reports", description: "Generate inventory valuation and movement reports.", readTime: "6 min", difficulty: "intermediate" },
      { id: "goods-receipts", title: "Goods Receipts", description: "Record incoming stock from suppliers.", readTime: "5 min", difficulty: "beginner" },
      { id: "decimal-quantities", title: "Decimal Quantities", description: "Configure products sold by weight or volume.", readTime: "4 min", difficulty: "intermediate" },
      { id: "price-management", title: "Price Management", description: "Set prices, markups, and price lists.", readTime: "6 min", difficulty: "intermediate" },
    ],
  },
  subscriptions: {
    title: "Subscriptions",
    description: "Manage your VentaPlus subscription and billing",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    articles: [
      { id: "plans-overview", title: "Plans Overview", description: "Compare Starter and Professional plans.", readTime: "4 min", difficulty: "beginner" },
      { id: "upgrade-plan", title: "Upgrade Your Plan", description: "How to upgrade from Starter to Professional.", readTime: "3 min", difficulty: "beginner" },
      { id: "billing-history", title: "Billing History", description: "View and download your payment invoices.", readTime: "3 min", difficulty: "beginner" },
      { id: "cancel-subscription", title: "Cancel Subscription", description: "How to cancel and what happens to your data.", readTime: "4 min", difficulty: "beginner" },
    ],
  },
  "payment-orders": {
    title: "Payment Orders",
    description: "Create and manage payment orders for suppliers",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    articles: [
      { id: "create-payment-order", title: "Create a Payment Order", description: "Generate payment orders for your suppliers.", readTime: "5 min", difficulty: "beginner" },
      { id: "payment-methods-suppliers", title: "Payment Methods for Suppliers", description: "Configure bank transfers, checks, and cash payments.", readTime: "5 min", difficulty: "intermediate" },
      { id: "partial-payments", title: "Partial Payments", description: "Handle partial payments and outstanding balances.", readTime: "6 min", difficulty: "intermediate" },
      { id: "payment-approval", title: "Payment Approval Workflow", description: "Set up approval processes for large payments.", readTime: "5 min", difficulty: "advanced" },
      { id: "payment-reports", title: "Payment Reports", description: "Track payment status and generate reports.", readTime: "4 min", difficulty: "beginner" },
      { id: "recurring-payments", title: "Recurring Payments", description: "Set up automatic recurring payment orders.", readTime: "5 min", difficulty: "intermediate" },
    ],
  },
  suppliers: {
    title: "Suppliers",
    description: "Supplier management, purchases, and returns",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-17.25" />
      </svg>
    ),
    articles: [
      { id: "add-supplier", title: "Add a Supplier", description: "Register new suppliers with their tax information.", readTime: "4 min", difficulty: "beginner" },
      { id: "purchase-orders", title: "Create Purchase Orders", description: "Generate purchase orders and track deliveries.", readTime: "6 min", difficulty: "beginner" },
      { id: "supplier-returns", title: "Process Supplier Returns", description: "Return defective or excess merchandise to suppliers.", readTime: "6 min", difficulty: "intermediate" },
      { id: "supplier-balance", title: "Supplier Account Balance", description: "Track what you owe to each supplier.", readTime: "5 min", difficulty: "intermediate" },
      { id: "supplier-documents", title: "Supplier Documents", description: "Manage invoices and receipts from suppliers.", readTime: "5 min", difficulty: "beginner" },
      { id: "import-suppliers", title: "Import Suppliers", description: "Bulk import supplier data from CSV.", readTime: "4 min", difficulty: "intermediate" },
      { id: "supplier-reports", title: "Supplier Reports", description: "Analyze purchasing patterns and costs.", readTime: "5 min", difficulty: "intermediate" },
    ],
  },
  customers: {
    title: "Customers",
    description: "Customer database, credit sales, and accounts",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    articles: [
      { id: "add-customer", title: "Register Customers", description: "Add customer profiles with tax and contact info.", readTime: "4 min", difficulty: "beginner" },
      { id: "credit-sales", title: "Credit Sales", description: "Process sales on credit and track balances.", readTime: "6 min", difficulty: "intermediate" },
      { id: "customer-accounts", title: "Customer Account Statements", description: "Generate and send account statements.", readTime: "5 min", difficulty: "intermediate" },
      { id: "customer-history", title: "Purchase History", description: "View customer purchase history and trends.", readTime: "4 min", difficulty: "beginner" },
      { id: "customer-import", title: "Import Customers", description: "Bulk import customer data via CSV.", readTime: "4 min", difficulty: "intermediate" },
    ],
  },
  expenses: {
    title: "Expenses",
    description: "Track and manage business expenses",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
      </svg>
    ),
    articles: [
      { id: "record-expense", title: "Record an Expense", description: "Log business expenses with categories and receipts.", readTime: "4 min", difficulty: "beginner" },
      { id: "expense-categories", title: "Expense Categories", description: "Organize expenses by custom categories.", readTime: "3 min", difficulty: "beginner" },
      { id: "expense-reports", title: "Expense Reports", description: "Generate detailed expense analysis reports.", readTime: "5 min", difficulty: "intermediate" },
      { id: "recurring-expenses", title: "Recurring Expenses", description: "Set up automatic recurring expense entries.", readTime: "4 min", difficulty: "intermediate" },
    ],
  },
  "fiscal-reports": {
    title: "Fiscal Reports",
    description: "Generate and understand fiscal and tax reports",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    articles: [
      { id: "iva-libro", title: "IVA Libro de Ventas", description: "Generate the IVA sales ledger for AFIP.", readTime: "6 min", difficulty: "intermediate" },
      { id: "iva-compras", title: "IVA Libro de Compras", description: "Generate the IVA purchase ledger.", readTime: "6 min", difficulty: "intermediate" },
      { id: "daily-z-report", title: "Daily Z Report", description: "End-of-day fiscal closure report.", readTime: "4 min", difficulty: "beginner" },
      { id: "monthly-summary", title: "Monthly Tax Summary", description: "Generate monthly tax summaries for accountants.", readTime: "5 min", difficulty: "intermediate" },
      { id: "export-to-accountant", title: "Export Data for Accountant", description: "Export fiscal data in formats your accountant needs.", readTime: "5 min", difficulty: "beginner" },
      { id: "tax-categories", title: "Tax Category Configuration", description: "Set up IVA rates and special tax categories.", readTime: "7 min", difficulty: "advanced" },
      { id: "profit-loss", title: "Profit & Loss Statement", description: "Understand your business profitability.", readTime: "6 min", difficulty: "intermediate" },
      { id: "sales-by-payment", title: "Sales by Payment Method", description: "Analyze sales broken down by payment type.", readTime: "4 min", difficulty: "beginner" },
      { id: "citi-reports", title: "CITI Reports", description: "Generate CITI Ventas and CITI Compras for AFIP.", readTime: "8 min", difficulty: "advanced" },
    ],
  },
  "initial-configuration": {
    title: "Initial Configuration",
    description: "Business setup, tax settings, and system preferences",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    articles: [
      { id: "business-profile", title: "Business Profile Setup", description: "Configure your business name, logo, and contact info.", readTime: "5 min", difficulty: "beginner" },
      { id: "tax-settings", title: "Tax Settings", description: "Configure IVA condition, CUIT, and tax rates.", readTime: "7 min", difficulty: "intermediate" },
      { id: "payment-config", title: "Payment Methods Configuration", description: "Set up accepted payment methods for your business.", readTime: "5 min", difficulty: "beginner" },
      { id: "user-roles", title: "User Roles & Permissions", description: "Define roles and access levels for your team.", readTime: "6 min", difficulty: "intermediate" },
      { id: "receipt-setup", title: "Receipt & Ticket Setup", description: "Customize receipts with your branding.", readTime: "5 min", difficulty: "beginner" },
      { id: "backup-data", title: "Data Backup & Export", description: "Back up your data and export for safekeeping.", readTime: "4 min", difficulty: "beginner" },
    ],
  },
};

const difficultyConfig = {
  beginner: { label: "Beginner", color: "var(--vp-success)", bg: "hsl(var(--vp-success) / 0.1)", border: "hsl(var(--vp-success) / 0.2)" },
  intermediate: { label: "Intermediate", color: "var(--vp-warning)", bg: "hsl(var(--vp-warning) / 0.1)", border: "hsl(var(--vp-warning) / 0.2)" },
  advanced: { label: "Advanced", color: "var(--vp-danger)", bg: "hsl(var(--vp-danger) / 0.1)", border: "hsl(var(--vp-danger) / 0.2)" },
};

export default function TutorialCategoryPage() {
  const params = useParams();
  const { t } = useLanguage();
  const categorySlug = params.category as string;
  const category = categoryDataMap[categorySlug];

  if (!category) {
    return (
      <>
        <Header />
        <main className="vp-page pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="vp-heading mb-4">Category not found</h1>
            <p className="text-[hsl(var(--vp-muted))] mb-8">
              The tutorial category you're looking for doesn't exist yet.
            </p>
            <Link href="/support/tutorials" className="vp-button vp-button-primary">
              ← Back to Tutorials
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="vp-page pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[hsl(var(--vp-border))]">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary))]/5 via-transparent to-[hsl(var(--vp-accent))]/4" />
          <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[hsl(var(--vp-muted))] mb-8 flex-wrap">
              <Link href="/" className="hover:text-[hsl(var(--vp-text))] transition-colors">Home</Link>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <Link href="/support/tutorials" className="hover:text-[hsl(var(--vp-text))] transition-colors">Tutorials</Link>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-[hsl(var(--vp-text))] font-medium">{category.title}</span>
            </nav>

            <div className="flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))]">
                {category.icon}
              </div>
              <div>
                <h1 className="vp-heading mb-2">{category.title}</h1>
                <p className="text-[hsl(var(--vp-muted))] text-lg">{category.description}</p>
                <p className="text-sm text-[hsl(var(--vp-muted))] mt-2">
                  {category.articles.length} {category.articles.length === 1 ? "article" : "articles"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Articles List */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid gap-4">
            {category.articles.map((article, index) => {
              const diff = difficultyConfig[article.difficulty];
              return (
                <div
                  key={article.id}
                  className="group vp-card p-5 sm:p-6 hover:shadow-[var(--vp-shadow)] hover:border-[hsl(var(--vp-primary))]/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-[hsl(var(--vp-text))] group-hover:text-[hsl(var(--vp-primary))] transition-colors">
                          {article.title}
                        </h3>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: `hsl(${diff.color})` }}
                        >
                          {diff.label}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--vp-muted))]">{article.description}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-[hsl(var(--vp-muted))] flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {article.readTime}
                      </span>
                      <svg className="w-5 h-5 text-[hsl(var(--vp-muted))] group-hover:text-[hsl(var(--vp-primary))] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Back Link */}
          <div className="mt-12 text-center">
            <Link href="/support/tutorials" className="vp-button inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Tutorials
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
