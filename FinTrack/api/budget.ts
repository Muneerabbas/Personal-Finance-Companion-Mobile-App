import { supabase } from '@/lib/supabase';

export const getBudget = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "No rows returned", meaning they haven't set a budget yet
    console.error('Error fetching budget:', error);
    throw error;
  }

  return data;
};

export const setBudget = async (monthlyLimit: number) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Check if budget exists first
  const existingBudget = await getBudget().catch(() => null);

  let result;
  if (existingBudget) {
     result = await supabase
      .from('budgets')
      .update({ monthly_limit: monthlyLimit })
      .eq('id', existingBudget.id)
      .select()
      .single();
  } else {
     result = await supabase
      .from('budgets')
      .insert({ user_id: user.id, monthly_limit: monthlyLimit })
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error setting budget:', result.error);
    throw result.error;
  }

  return result.data;
};
