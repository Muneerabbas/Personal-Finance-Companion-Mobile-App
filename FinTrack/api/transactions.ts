import { supabase } from '@/lib/supabase';
import { TransactionPayload, mapPayloadToUITransaction } from '@/lib/transaction-helper';

export const getTransactions = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return data.map(mapDbToApiTransaction);
};

export const addTransaction = async (payload: TransactionPayload) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const parsedRow = mapPayloadToUITransaction(payload);
  
  const dbPayload = {
    user_id: user.id,
    title: parsedRow.title,
    amount: parsedRow.amount,
    category: parsedRow.category,
    payment_method: parsedRow.paymentMethod || 'Cash',
    created_at: new Date().toISOString(),
    icon: parsedRow.icon,
    icon_background: parsedRow.iconBackground,
    icon_color: parsedRow.iconColor,
    is_other_category: parsedRow.isOtherCategory || false,
  };

  const { data, error } = await supabase.from('transactions').insert(dbPayload).select().single();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }

  return mapDbToApiTransaction(data);
};

function mapDbToApiTransaction(dbItem: any) {
  return {
    id: dbItem.id,
    title: dbItem.title,
    category: dbItem.category,
    amount: dbItem.amount,
    paymentMethod: dbItem.payment_method || '',
    timeLabel: new Date(dbItem.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    date: dbItem.created_at,
    icon: dbItem.icon,
    iconBackground: dbItem.icon_background,
    iconColor: dbItem.icon_color,
    isOtherCategory: dbItem.is_other_category,
  };
}
