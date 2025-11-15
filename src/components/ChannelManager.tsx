import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PaymentChannel } from '../types/database';

export default function ChannelManager() {
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    channel_id: '',
    provider: 'm-pesa' as 'm-pesa' | 'sasapay',
    is_wallet: false,
    network_code: '',
  });

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_channels')
        .select('*')
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('payment_channels').insert({
        user_id: user.id,
        name: formData.name,
        channel_id: parseInt(formData.channel_id),
        provider: formData.provider,
        is_wallet: formData.is_wallet,
        network_code: formData.is_wallet ? formData.network_code : null,
      });

      if (error) throw error;

      setFormData({
        name: '',
        channel_id: '',
        provider: 'm-pesa',
        is_wallet: false,
        network_code: '',
      });
      setShowForm(false);
      loadChannels();
    } catch (err: any) {
      console.error('Error creating channel:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleChannelStatus = async (channelId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_channels')
        .update({ is_active: !currentStatus })
        .eq('id', channelId);

      if (error) throw error;
      loadChannels();
    } catch (err: any) {
      console.error('Error updating channel:', err);
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="channel-manager-container">
      <div className="header-row">
        <h2>Payment Channels</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-secondary">
          {showForm ? 'Cancel' : 'Add Channel'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="channel-form">
          <div className="form-group">
            <label htmlFor="name">Channel Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="My Paybill"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="channel_id">PayHero Channel ID</label>
            <input
              type="number"
              id="channel_id"
              name="channel_id"
              value={formData.channel_id}
              onChange={handleChange}
              placeholder="133"
              required
              disabled={loading}
            />
            <small>Found in PayHero dashboard under Payment Channels</small>
          </div>

          <div className="form-group">
            <label htmlFor="provider">Provider</label>
            <select
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="m-pesa">M-PESA</option>
              <option value="sasapay">SasaPay</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_wallet"
                checked={formData.is_wallet}
                onChange={handleChange}
                disabled={loading}
              />
              <span>This is a wallet channel</span>
            </label>
          </div>

          {formData.is_wallet && (
            <div className="form-group">
              <label htmlFor="network_code">Network Code</label>
              <input
                type="text"
                id="network_code"
                name="network_code"
                value={formData.network_code}
                onChange={handleChange}
                placeholder="63902"
                required
                disabled={loading}
              />
              <small>Use 63902 for M-PESA</small>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Channel'}
          </button>
        </form>
      )}

      <div className="channels-list">
        {channels.length === 0 ? (
          <p className="empty-state">No payment channels configured</p>
        ) : (
          <div className="channels-grid">
            {channels.map(channel => (
              <div key={channel.id} className={`channel-card ${!channel.is_active ? 'inactive' : ''}`}>
                <div className="channel-header">
                  <h3>{channel.name}</h3>
                  <span className={`badge ${channel.is_active ? 'badge-success' : 'badge-neutral'}`}>
                    {channel.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="channel-details">
                  <p><strong>Channel ID:</strong> {channel.channel_id}</p>
                  <p><strong>Provider:</strong> {channel.provider}</p>
                  <p><strong>Type:</strong> {channel.is_wallet ? 'Wallet' : 'External'}</p>
                  {channel.network_code && <p><strong>Network:</strong> {channel.network_code}</p>}
                </div>
                <button
                  onClick={() => toggleChannelStatus(channel.id, channel.is_active)}
                  className="btn-secondary btn-small"
                >
                  {channel.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
