import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Payment } from '../types/database';

export default function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();

    const subscription = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          loadPayments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPayments(data || []);
    } catch (err: any) {
      console.error('Error loading payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const classes: Record<Payment['status'], string> = {
      QUEUED: 'badge badge-info',
      PENDING: 'badge badge-warning',
      SUCCESS: 'badge badge-success',
      FAILED: 'badge badge-error',
      CANCELLED: 'badge badge-neutral',
    };
    return <span className={classes[status]}>{status}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  if (error) {
    return <div className="alert alert-error">Error: {error}</div>;
  }

  return (
    <div className="payments-list-container">
      <h2>Recent Payments</h2>

      {payments.length === 0 ? (
        <p className="empty-state">No payments yet</p>
      ) : (
        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Phone</th>
                <th>Customer</th>
                <th>Reference</th>
                <th>Receipt</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.created_at)}</td>
                  <td className="amount">{formatAmount(payment.amount)}</td>
                  <td>{payment.phone_number}</td>
                  <td>{payment.customer_name || '-'}</td>
                  <td className="reference">{payment.external_reference || payment.payhero_reference || '-'}</td>
                  <td className="receipt">{payment.mpesa_receipt_number || '-'}</td>
                  <td>{getStatusBadge(payment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
