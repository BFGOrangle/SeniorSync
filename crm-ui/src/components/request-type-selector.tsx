"use client";

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { requestTypeApiService, RequestTypeDto } from '@/services/request-type-api';
import { staffApiService } from '@/services/staff-api';
import { useToast } from '@/hooks/use-toast';

interface RequestTypeSelectWithCreateProps {
  value?: number;
  onChange: (id: number | undefined, meta?: { name?: string; description?: string }) => void;
  disabled?: boolean;
  placeholder?: string;
  centerId?: number; // optional override
  allowCreate?: boolean;
  className?: string;
}

export function RequestTypeSelectWithCreate({
  value,
  onChange,
  disabled,
  placeholder = 'Select request type...',
  centerId: centerIdProp,
  allowCreate = true,
  className,
}: RequestTypeSelectWithCreateProps) {
  const { toast } = useToast();
  const [centerId, setCenterId] = useState<number | null>(centerIdProp ?? null);
  const [requestTypes, setRequestTypes] = useState<RequestTypeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const load = useCallback(async (cid: number) => {
    setLoading(true);
    try {
      const list = await requestTypeApiService.getAllByCenter(cid);
      setRequestTypes(list);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load request types', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Resolve centerId if not provided
  useEffect(() => {
    if (centerIdProp) {
      setCenterId(centerIdProp);
      load(centerIdProp);
      return;
    }
    (async () => {
      try {
        const profile = await staffApiService.getCurrentUserProfile();
        if (profile?.centerId) {
          setCenterId(profile.centerId);
          load(profile.centerId);
        }
      } catch (e) {
        console.error('Failed to fetch staff profile for centerId', e);
      }
    })();
  }, [centerIdProp, load]);

  const handleCreate = async () => {
    if (!centerId || !newName.trim() || !newDescription.trim()) return;
    setCreating(true);
    try {
      await requestTypeApiService.create({ name: newName.trim(), description: newDescription.trim(), centerId });
      toast({ title: 'Added', description: 'Request type created for your center.' });
      setNewName('');
      setNewDescription('');
      await load(centerId);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to create request type.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={className}>      
      <div className="space-y-2">
        <SearchableSelect
          options={requestTypes.map(rt => ({
            value: rt.id.toString(),
            label: rt.name,
            subtitle: rt.description || undefined,
          }))}
          value={value?.toString()}
          onValueChange={(val) => {
            const id = val ? parseInt(val) : undefined;
            const rt = requestTypes.find(r => r.id === id);
            onChange(id, { name: rt?.name, description: (rt?.description ?? undefined) });
          }}
          placeholder={loading ? 'Loading request types...' : placeholder}
          searchPlaceholder="Search request types..."
          emptyMessage={allowCreate ? 'No request types found. Create one below.' : 'No request types.'}
          disabled={disabled || loading}
        />

        {allowCreate && !showCreateForm && (
          <div className="pt-1">
            <Button type="button" size="sm" variant="ghost" disabled={!centerId || loading} onClick={() => setShowCreateForm(true)}>
              <PlusCircle className="h-4 w-4 mr-1" /> Create new request type
            </Button>
          </div>
        )}
        {allowCreate && showCreateForm && (
          <div className="space-y-2 border rounded-md p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Input
                placeholder="New request type name *"
                value={newName}
                disabled={!centerId || creating}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!newName.trim() || !newDescription.trim() || !centerId || creating}
                  onClick={handleCreate}
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={creating}
                  onClick={() => { setShowCreateForm(false); setNewName(''); setNewDescription(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Short description (purpose, example) *"
              value={newDescription}
              disabled={!centerId || creating}
              onChange={(e) => setNewDescription(e.target.value)}
              className="min-h-[70px]"
            />
            <p className="text-[11px] text-muted-foreground">Both name and description are required. Created types are scoped to your center.</p>
          </div>
        )}
        {!centerId && (
          <p className="text-xs text-muted-foreground">Center not detected; cannot add new request types.</p>
        )}
      </div>
    </div>
  );
}
