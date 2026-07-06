import React, { useState, useEffect } from 'react';
import { useGetSalesQuery } from '../../redux/features/sales/salesApi';
import { getSocket } from '../../lib/socket';
import { useAppDispatch } from '../../app/hooks';
import { baseApi } from '../../redux/api/baseApi';
import { PageHeader } from '../../components/shared/PageHeader';
import { Pagination } from '../../components/shared/Pagination';
import { formatDate, formatCurrency } from '../../lib/utils';
import { Eye, X, Receipt, RefreshCw, AlertTriangle, Printer, Download } from 'lucide-react';
import { type Sale } from '../../types/sale';
import { SalesHistorySkeleton } from '../../skeleton/SalesHistorySkeleton';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface SaleDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleDetailsDialog: React.FC<SaleDetailsDialogProps> = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const soldByName = typeof sale.soldBy === 'object' ? sale.soldBy.name : 'Unknown User';

  const handlePrint = () => {
    const itemsRows = sale.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">${item.productName}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">$${item.subtotal.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    // Create a hidden iframe for isolated, pagination-optimized printing (always 1 page)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt-${sale._id}</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; font-size: 13px; }
            .header { border-bottom: 2px solid #0f62fe; padding-bottom: 12px; margin-bottom: 15px; }
            .title { font-size: 20px; font-weight: 800; color: #0f172a; tracking: -0.025em; line-height: 28px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9; }
            .meta-label { color: #64748b; font-weight: 500; }
            .meta-val { font-weight: 600; color: #334155; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
            .total-box { margin-top: 20px; text-align: right; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .grand-total { font-size: 16px; font-weight: 800; color: #0f62fe; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="float: left; margin-right: 10px; margin-top: 1px;">
              <svg viewBox="0 0 100 100" style="height: 26px; width: 26px;" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="38" stroke="#0F62FE" stroke-width="11" stroke-linecap="round" stroke-dasharray="170 50" transform="rotate(-40 50 50)" />
                <path d="M26 62 L42 46 L58 56 L74 30" stroke="#0F62FE" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M62 30 H74 V42" stroke="#0F62FE" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="title">ClassyERP Transaction Invoice</div>
            <div style="clear: both;"></div>
          </div>
          <div class="meta-grid">
            <div><span class="meta-label">Customer:</span> <span class="meta-val">${sale.customer}</span></div>
            <div><span class="meta-label">Date & Time:</span> <span class="meta-val">${new Date(sale.createdAt).toLocaleString()}</span></div>
            <div><span class="meta-label">Sold By:</span> <span class="meta-val">${soldByName}</span></div>
            <div><span class="meta-label">Transaction ID:</span> <span class="meta-val" style="font-family: monospace; font-size: 11px;">${sale._id}</span></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div class="total-box">
            <div style="color: #64748b;">Total Items: <strong style="color: #334155;">${sale.items.length}</strong></div>
            <div style="margin-top: 6px; font-weight: 700; color: #0f172a;">Grand Total: <span class="grand-total">$${sale.grandTotal.toFixed(2)}</span></div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const handleDownloadReceipt = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = '#0F62FE';
      const textColor = '#1E293B';
      const grayColor = '#64748B';
      const lightGray = '#F8FAFC';
      const borderLight = '#E2E8F0';

      // Draw Vector Brand Logo Emblem (cx=26, cy=24, r=5.5)
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.85);
      doc.circle(26, 24, 5.5, 'S');

      // Growth lines
      doc.line(22.5, 27.5, 25, 24);
      doc.line(25, 24, 27.5, 26);
      doc.line(27.5, 26, 30.5, 21.5);

      // Arrowhead
      doc.line(28.5, 21.5, 30.5, 21.5);
      doc.line(30.5, 21.5, 30.5, 23.5);

      // Header Brand Text (shifted right to fit logo)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(textColor);
      doc.text('ClassyERP Transaction Invoice', 35, 24);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayColor);
      doc.text('Thank you for your transaction!', 35, 30);

      // Accent divider line
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.8);
      doc.line(20, 36, 190, 36);

      // Details Metadata Card background
      doc.setFillColor(lightGray);
      doc.setDrawColor(borderLight);
      doc.setLineWidth(0.25);
      doc.roundedRect(20, 42, 170, 28, 3, 3, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(grayColor);
      doc.text('Customer:', 25, 49);
      doc.text('Sold By:', 25, 61);
      doc.text('Date & Time:', 105, 49);
      doc.text('Transaction ID:', 105, 61);

      doc.setTextColor(textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(sale.customer, 43, 49);
      doc.text(soldByName, 41, 61);
      doc.text(new Date(sale.createdAt).toLocaleString(), 125, 49);
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.text(sale._id, 131, 61);

      // Table Header outline
      let y = 80;
      doc.setFillColor(lightGray);
      doc.roundedRect(20, y, 170, 9, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(textColor);
      doc.text('Product', 23, y + 6);
      doc.text('Qty', 115, y + 6);
      doc.text('Unit Price', 135, y + 6);
      doc.text('Subtotal', 165, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      y += 9;

      sale.items.forEach((item) => {
        doc.setDrawColor(borderLight);
        doc.line(20, y + 8, 190, y + 8);

        doc.text(item.productName, 23, y + 5.5);
        doc.text(String(item.quantity), 117, y + 5.5);
        doc.text(`$${item.unitPrice.toFixed(2)}`, 135, y + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`$${item.subtotal.toFixed(2)}`, 165, y + 5.5);
        doc.setFont('helvetica', 'normal');
        y += 8;
      });

      // Subtotal summaries
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.text('Total Items:', 130, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(sale.items.length), 175, y);

      y += 5;
      doc.setDrawColor(borderLight);
      doc.line(130, y, 190, y);

      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('Grand Total:', 130, y);
      doc.setFontSize(12.5);
      doc.setTextColor(primaryColor);
      doc.text(`$${sale.grandTotal.toFixed(2)}`, 160, y);

      // System Signature
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(grayColor);
      doc.text('ClassyERP Inc. - Inventory & Sales Management System', 62, 275);

      doc.save(`ClassyERP-Receipt-${sale._id.slice(-6)}.pdf`);
      toast.success('Invoice PDF downloaded successfully!');
    } catch {
      toast.error('Failed to generate PDF invoice. Please ensure "jspdf" dependency is loaded.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-backdrop-fade"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        id="print-receipt-area"
        className="relative w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-xl flex flex-col max-h-[85vh] animate-modal-scale"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-slate-800">
            <Receipt className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-950">Sale Transaction Receipt</h3>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-800"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Customer</span>
              <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                {sale.customer}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Date & Time</span>
              <span className="font-semibold text-slate-800 block mt-0.5">
                {formatDate(sale.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Sold By</span>
              <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                {soldByName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Transaction ID</span>
              <span className="font-mono text-slate-600 block mt-0.5 truncate">{sale._id}</span>
            </div>
          </div>

          {/* Items breakdown table */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Items List
            </span>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-500 uppercase">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sale.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotals & Grand total summary */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Total Items:</span>
                <span className="font-medium text-slate-800">{sale.items.length}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Grand Total:</span>
                <span className="text-lg font-extrabold text-blue-600">
                  {formatCurrency(sale.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 flex-shrink-0 print:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Receipt
            </button>
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const SalesHistoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewSale = () => {
      dispatch(baseApi.util.invalidateTags(['Sale']));
    };

    socket.on('newSale', handleNewSale);

    return () => {
      socket.off('newSale', handleNewSale);
    };
  }, [dispatch]);

  const { data, isLoading, error, refetch } = useGetSalesQuery({ page, limit });

  // Dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const handleOpenDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return <SalesHistorySkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-red-100 rounded-xl text-center space-y-4 shadow-xs">
        <div className="p-3 bg-red-50 text-red-600 rounded-full">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-800">Failed to Load Sales Ledger</h3>
          <p className="text-xs text-slate-500">
            There was a problem communicating with the server.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const { sales = [], meta } = data ?? {
    sales: [],
    meta: { page: 1, limit, total: 0, totalPage: 1 },
  };

  return (
    <div className="space-y-6 animate-page-entrance">
      <PageHeader
        title="Sales History"
        description="View past sales ledger logs, details breakdown, and transaction totals."
      />

      {sales.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop/Tablet Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items Summary</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4">Sold By</th>
                    <th className="px-6 py-4 text-right w-24">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {sales.map((sale) => {
                    const firstItem = sale.items[0]?.productName ?? 'Unknown Product';
                    const itemsSummary =
                      firstItem + (sale.items.length > 1 ? ` + ${sale.items.length - 1} more` : '');
                    const sellerName =
                      typeof sale.soldBy === 'object' ? sale.soldBy.name : 'Unknown User';

                    return (
                      <tr
                        key={sale._id}
                        onClick={() => handleOpenDetails(sale)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-slate-500">{formatDate(sale.createdAt)}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900 truncate max-w-[150px]">
                          {sale.customer}
                        </td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[220px]">
                          {itemsSummary}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatCurrency(sale.grandTotal)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{sellerName}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(sale);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              limit={limit}
              total={meta?.total ?? 0}
              totalPage={meta?.totalPage ?? 1}
              onPageChange={setPage}
            />
          </div>

          {/* Mobile Stacked Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            <div className="grid grid-cols-1 gap-4">
              {sales.map((sale) => {
                const firstItem = sale.items[0]?.productName ?? 'Unknown Product';
                const itemsSummary =
                  firstItem + (sale.items.length > 1 ? ` + ${sale.items.length - 1} more` : '');
                const sellerName =
                  typeof sale.soldBy === 'object' ? sale.soldBy.name : 'Unknown User';

                return (
                  <div
                    key={sale._id}
                    onClick={() => handleOpenDetails(sale)}
                    className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs cursor-pointer active:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-base">
                          Customer: {sale.customer}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(sale.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-extrabold text-blue-600">
                        {formatCurrency(sale.grandTotal)}
                      </span>
                    </div>

                    <div className="text-xs pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Items:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[200px]">
                          {itemsSummary}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sold By:</span>
                        <span className="font-medium text-slate-700">{sellerName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <Pagination
                page={page}
                limit={limit}
                total={meta?.total ?? 0}
                totalPage={meta?.totalPage ?? 1}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center shadow-xs">
          <Receipt className="h-10 w-10 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No transactions recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Transactions will appear here once new sales are completed in the Create Sale terminal.
          </p>
        </div>
      )}

      {/* Details Receipt Dialog */}
      <SaleDetailsDialog
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};
export default SalesHistoryPage;
