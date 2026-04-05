import { supabase } from '@/lib/supabase';

// Map DB row to UI if needed, for now we can just return rows directly

export const getGoals = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }

  return data;
};

export const addGoal = async (payload: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const dbPayload = {
    user_id: user.id,
    title: payload.title,
    target_amount: payload.target_amount,
    saved_amount: payload.saved_amount || 0,
    deadline: payload.deadline,
    icon: payload.icon || 'star',
    is_primary: payload.is_primary || false,
  };

  const { data, error } = await supabase.from('goals').insert(dbPayload).select().single();

  if (error) {
    console.error('Error adding goal:', error);
    throw error;
  }

  return data;
};
