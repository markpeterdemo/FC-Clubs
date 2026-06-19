'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import type { SkinInventory, SkinFormData, SkinStatus } from './types';

async function fetchItems(): Promise<SkinInventory[]> {
  const res = await fetch('/api/trades');
  if (!res.ok) throw new Error('Failed to load inventory');
  return res.json();
}

async function saveItem(data: {
  form: SkinFormData;
  editingId?: string;
}): Promise<SkinInventory> {
  const res = await fetch('/api/trades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.editingId,
        skin_name: data.form.skin_name,
        buy_price: parseFloat(data.form.buy_price),
        sell_price: parseFloat(data.form.sell_price || '0'),
        sold_price: parseFloat(data.form.sold_price || '0'),
        float_value: data.form.float_value ? parseFloat(data.form.float_value) : null,
        withdrawal_method: data.form.withdrawal_method || null,
        status: data.form.status,
        notes: data.form.notes,
        image_url: data.form.image_url || '',
        platform: data.form.platform,
      }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Save failed' }));
    throw new Error(err.error || 'Save failed');
  }
  return res.json();
}

async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: fetchItems,
  });
}

export function useSaveItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      item,
      status,
      sell_price,
      sold_price,
    }: {
      item: SkinInventory;
      status: SkinStatus;
      sell_price?: number;
      sold_price?: number;
    }) => {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          skin_name: item.skin_name,
          buy_price: item.buy_price,
          sell_price: sell_price ?? item.sell_price,
          sold_price: sold_price ?? item.sold_price,
          float_value: item.float_value,
          withdrawal_method: item.withdrawal_method,
          status,
          notes: item.notes,
          image_url: item.image_url,
          platform: item.platform,
        }),
      });
      if (!res.ok) throw new Error('Status update failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
