/*
  # Payment System Schema

  1. New Tables
    - `payment_channels`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Channel name
      - `channel_id` (integer) - PayHero channel ID
      - `provider` (text) - Payment provider (m-pesa, sasapay)
      - `is_wallet` (boolean) - Whether this is a wallet channel
      - `network_code` (text) - For wallet channels (63902 for MPESA)
      - `is_active` (boolean) - Channel status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `channel_id` (uuid, references payment_channels)
      - `amount` (numeric) - Payment amount
      - `phone_number` (text) - Customer phone number
      - `customer_name` (text) - Customer name
      - `external_reference` (text) - Your internal reference
      - `payhero_reference` (text) - PayHero reference
      - `checkout_request_id` (text) - MPESA checkout request ID
      - `mpesa_receipt_number` (text) - MPESA receipt number
      - `status` (text) - Payment status (QUEUED, PENDING, SUCCESS, FAILED)
      - `result_code` (integer) - Result code from callback
      - `result_description` (text) - Result description from callback
      - `metadata` (jsonb) - Additional data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policy for service role to update payment status via callbacks
*/

-- Create payment_channels table
CREATE TABLE IF NOT EXISTS payment_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  channel_id integer NOT NULL,
  provider text NOT NULL CHECK (provider IN ('m-pesa', 'sasapay')),
  is_wallet boolean DEFAULT false,
  network_code text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  channel_id uuid REFERENCES payment_channels,
  amount numeric NOT NULL CHECK (amount > 0),
  phone_number text NOT NULL,
  customer_name text,
  external_reference text,
  payhero_reference text,
  checkout_request_id text,
  mpesa_receipt_number text,
  status text DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  result_code integer,
  result_description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payhero_reference ON payments(payhero_reference);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_request_id ON payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_reference ON payments(external_reference);
CREATE INDEX IF NOT EXISTS idx_payment_channels_user_id ON payment_channels(user_id);

-- Enable RLS
ALTER TABLE payment_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_channels
CREATE POLICY "Users can view own payment channels"
  ON payment_channels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment channels"
  ON payment_channels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment channels"
  ON payment_channels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment channels"
  ON payment_channels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to update payment status (for callbacks)
CREATE POLICY "Service role can update all payments"
  ON payments FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_payment_channels_updated_at
  BEFORE UPDATE ON payment_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
