import React, { useEffect, useState } from 'react';
import { ReceiptIndianRupee, Plus } from 'lucide-react';
import api from '../api/api.client';
import { formatDate, formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
  UNPAID: 'bg-red-100 text-red-600',
};

export const BillingPage: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/billing').then((r) => setBills(r.data)).finally(() => setLoading(false));
  }, []);

  const totalRevenue = bills.filter((b) => b.status === 'PAID').reduce((s, b) => s + parseFloat(b.totalAmount), 0);
  const outstanding = bills.filter((b) => b.status !== 'PAID').reduce((s, b) => s + (parseFloat(b.totalAmount) - parseFloat(b.paidAmount)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground text-sm mt-1">{bills.length} billing records</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-all">
          <Plus size={16} /> Create Bill
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-5">
          <p className="text-sm text-green-700 font-medium">Total Revenue (Paid)</p>
          <p className="text-2xl font-heading font-bold text-green-800 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <p className="text-sm text-red-700 font-medium">Outstanding Amount</p>
          <p className="text-2xl font-heading font-bold text-red-800 mt-1">{formatCurrency(outstanding)}</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading billing records...</div>
        ) : bills.length === 0 ? (
          <div className="p-12 text-center">
            <ReceiptIndianRupee size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No billing records found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {['Patient', 'Date', 'Total', 'Paid', 'Method', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{b.appointment?.patient?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(b.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(parseFloat(b.totalAmount))}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(parseFloat(b.paidAmount))}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{b.paymentMethod?.toLowerCase() || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded-md text-xs font-semibold', STATUS_STYLES[b.status])}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
