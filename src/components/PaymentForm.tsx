import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PaymentChannel } from '../types/database';

interface PaymentFormProps {
  onPaymentInitiated?: (paymentId: string) => void;
}

export default function PaymentForm({ onPaymentInitiated }: PaymentFormProps) {
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    phone_number: '',
    channel_id: '',
    customer_name: '',
    external_reference: '',
  });

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (err: any) {
      console.error('Error loading channels:', err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to initiate a payment');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-payment`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          phone_number: formData.phone_number,
          channel_id: formData.channel_id,
          customer_name: formData.customer_name || undefined,
          external_reference: formData.external_reference || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate payment');
      }

      const result = await response.json();
      setSuccess(`Payment initiated successfully! Reference: ${result.payhero_reference}`);

      if (onPaymentInitiated) {
        onPaymentInitiated(result.payment_id);
      }

      setFormData({
        amount: '',
        phone_number: '',
        channel_id: formData.channel_id,
        customer_name: '',
        external_reference: '',
      });
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="payment-form-container">
      <h2>Initiate Payment</h2>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="channel_id">Payment Channel</label>
          <select
            id="channel_id"
            name="channel_id"
            value={formData.channel_id}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select a channel</option>
            {channels.map(channel => (
              <option key={channel.id} value={channel.id}>
                {channel.name} ({channel.provider})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (KES)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="100"
            min="1"
            step="1"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="0712345678"
            pattern="^0[17]\d{8}$"
            required
            disabled={loading}
          />
          <small>Format: 07XXXXXXXX or 01XXXXXXXX</small>
        </div>

        <div className="form-group">
          <label htmlFor="customer_name">Customer Name (Optional)</label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="external_reference">Reference (Optional)</label>
          <input
            type="text"
            id="external_reference"
            name="external_reference"
            value={formData.external_reference}
            onChange={handleChange}
            placeholder="INV-001"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Processing...' : 'Initiate Payment'}
        </button>
      </form>
    </div>
  );
}
