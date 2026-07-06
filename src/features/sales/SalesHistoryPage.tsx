import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { ClassyLogo } from '../../components/shared/ClassyLogo';

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
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f62fe; padding-bottom: 12px; margin-bottom: 15px; }
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 220" style="height: 34px; width: auto; fill: none;">
              <defs>
                <linearGradient id="classyGradFullPrint" x1="10%" y1="90%" x2="90%" y2="10%">
                  <stop offset="0%" stop-color="#0f62fe" />
                  <stop offset="60%" stop-color="#3b82f6" />
                  <stop offset="100%" stop-color="#1d4ed8" />
                </linearGradient>
              </defs>
              <g transform="translate(10, 10) scale(0.95)" fill="url(#classyGradFullPrint)">
                <path d="M110,10 A100,100 0 1,0 205,140 L180,132 A75,75 0 1,1 110,35 Z" />
                <path d="M110,50 A60,60 0 0,0 60,145 L78,130 A40,40 0 0,1 110,70 Z" />
                <path d="M 15,195 L 90,110 L 125,145 L 180,65 L 165,55 L 210,25 L 195,85 L 180,75 L 125,165 L 90,135 L 35,200 Z" />
                <polygon points="90,165 105,145 120,165" />
                <rect x="135" y="95" width="60" height="22" rx="2" />
                <rect x="120" y="125" width="75" height="22" rx="2" />
              </g>
              <text x="235" y="145" font-family="'Montserrat', 'Arial', sans-serif" font-weight="700" font-size="95" letter-spacing="-2">
                <tspan fill="#0f172a">Classy</tspan><tspan fill="#0f62fe">ERP</tspan>
              </text>
            </svg>
            <div style="font-size: 13px; font-weight: bold; color: #64748b;">Transaction Invoice Receipt</div>
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
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 220" width="750" height="220">
          <defs>
            <linearGradient id="pdfGrad" x1="10%" y1="90%" x2="90%" y2="10%">
              <stop offset="0%" stop-color="#0f62fe" />
              <stop offset="60%" stop-color="#3b82f6" />
              <stop offset="100%" stop-color="#1d4ed8" />
            </linearGradient>
          </defs>
          <g transform="translate(10, 10) scale(0.95)" fill="url(#pdfGrad)">
            <path d="M110,10 A100,100 0 1,0 205,140 L180,132 A75,75 0 1,1 110,35 Z" />
            <path d="M110,50 A60,60 0 0,0 60,145 L78,130 A40,40 0 0,1 110,70 Z" />
            <path d="M 15,195 L 90,110 L 125,145 L 180,65 L 165,55 L 210,25 L 195,85 L 180,75 L 125,165 L 90,135 L 35,200 Z" />
            <polygon points="90,165 105,145 120,165" />
            <rect x="135" y="95" width="60" height="22" rx="2" />
            <rect x="120" y="125" width="75" height="22" rx="2" />
          </g>
          <text x="235" y="145" font-family="'Montserrat', 'Arial', sans-serif" font-weight="700" font-size="95" letter-spacing="-2">
            <tspan fill="#0f172a">Classy</tspan><tspan fill="#0f62fe">ERP</tspan>
          </text>
        </svg>
      `;

      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 750;
          canvas.height = 220;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context not supported');
          ctx.drawImage(img, 0, 0);
          const imgData = canvas.toDataURL('image/png');

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

          // Embed Vector ClassyERP Logo
          doc.addImage(imgData, 'PNG', 20, 15, 34, 10);

          // Header Text (shifted to match logo alignment)
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(textColor);
          doc.text('Transaction Invoice Receipt', 190, 22, { align: 'right' });

          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(grayColor);
          doc.text('Thank you for your transaction!', 190, 27, { align: 'right' });

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

          doc.save(`ClassyERP-Receipt-${sale._id.slice(-6)}.pdf`);
          toast.success('Invoice PDF downloaded successfully!');
        } catch (err) {
          console.error(err);
          toast.error('Failed to generate PDF layout.');
        }
      };
    } catch {
      toast.error('Failed to initialize PDF downloader.');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 animate-backdrop-fade" onClick={onClose} />

      {/* Modal Container */}
      <div
        id="print-receipt-area"
        className="relative w-full max-w-2xl rounded-xl bg-card border border-border shadow-xl flex flex-col max-h-[85vh] animate-modal-scale text-foreground"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-foreground">Sale Transaction Receipt</h3>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible">
          {/* Logo Brand Banner */}
          <div className="flex justify-between items-start border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ClassyLogo className="h-7" />
              </div>
              <p className="text-[10px] text-muted-foreground">ClassyERP Inventory System</p>
            </div>
            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/50">
                Paid in Full
              </span>
              <p className="text-[10px] font-mono text-muted-foreground">TxId: {sale._id}</p>
            </div>
          </div>

          {/* Customer / Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-1">
                Billed To
              </span>
              <p className="font-semibold text-foreground">{sale.customer || 'Walk-in Customer'}</p>
              <p className="text-muted-foreground text-[10px] mt-0.5">ClassyERP Account Member</p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-1">
                Transaction Date
              </span>
              <p className="font-semibold text-foreground">{formatDate(sale.createdAt)}</p>
              <p className="text-muted-foreground text-[10px] mt-0.5">Status: Completed</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted text-muted-foreground font-semibold border-b border-border">
                  <th className="p-3">Product Item</th>
                  <th className="p-3 text-center">Unit Price</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 text-foreground">
                    <td className="p-3 font-medium">{item.productName}</td>
                    <td className="p-3 text-center font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-center font-semibold">{item.quantity}</td>
                    <td className="p-3 text-right font-semibold font-mono">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="w-full max-w-[240px] ml-auto space-y-2 border-t border-border pt-4 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Items Subtotal:</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(sale.grandTotal)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Sales Tax (0%):</span>
              <span className="font-mono font-medium text-foreground">$0.00</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
              <span>Grand Total:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {formatCurrency(sale.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex h-16 items-center justify-between px-6 border-t border-border bg-muted/30 flex-shrink-0 print:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Receipt
            </button>
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
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
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-red-100 dark:border-red-950/30 rounded-xl text-center space-y-4 shadow-xs text-foreground">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Failed to Load Sales Ledger</h3>
          <p className="text-xs text-muted-foreground">
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
    <div className="space-y-6 animate-page-entrance text-foreground">
      <PageHeader
        title="Sales History"
        description="View past sales ledger logs, details breakdown, and transaction totals."
      />

      {sales.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop/Tablet Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items Summary</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4">Sold By</th>
                    <th className="px-6 py-4 text-right w-24">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm text-foreground">
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
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDate(sale.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[150px]">
                          {sale.customer}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[220px]">
                          {itemsSummary}
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground">
                          {formatCurrency(sale.grandTotal)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{sellerName}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(sale);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-muted rounded-lg transition-colors"
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
                    className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs cursor-pointer active:bg-muted/30 transition-colors text-foreground"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground text-base">
                          Customer: {sale.customer}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(sale.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                        {formatCurrency(sale.grandTotal)}
                      </span>
                    </div>

                    <div className="text-xs pt-3 border-t border-border space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="font-medium text-foreground truncate max-w-[200px]">
                          {itemsSummary}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sold By:</span>
                        <span className="font-medium text-foreground">{sellerName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-border overflow-hidden bg-card">
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
        <div className="bg-card rounded-xl p-8 border border-border text-center shadow-xs text-foreground">
          <Receipt className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold text-foreground">No transactions recorded</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
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
