"use client";

import { useEffect, useState } from 'react';
import { requestTypeApiService, RequestTypeDto } from '@/services/request-type-api';
import { staffApiService } from '@/services/staff-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RequestTypeRow { id?: number; name: string; description?: string | null; isGlobal?: boolean | null }

export default function AdminRequestTypesPage() {
  const [centerId, setCenterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [customTypes, setCustomTypes] = useState<RequestTypeRow[]>([]);
  const [globalTypes, setGlobalTypes] = useState<RequestTypeRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const { toast } = useToast();

  const load = async (cid: number) => {
    setLoading(true);
    try {
  const list: RequestTypeDto[] = await requestTypeApiService.getAllByCenter(cid);
  setGlobalTypes(
    list
      .filter(rt => rt.isGlobal)
      .map(rt => ({ id: rt.id, name: rt.name, description: rt.description, isGlobal: rt.isGlobal }))
      .sort((a,b) => a.name.localeCompare(b.name))
  );
  setCustomTypes(
    list
      .filter(rt => !rt.isGlobal)
      .map(rt => ({ id: rt.id, name: rt.name, description: rt.description, isGlobal: rt.isGlobal }))
      .sort((a,b) => a.name.localeCompare(b.name))
  );
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load request types', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const profile = await staffApiService.getCurrentUserProfile();
        if (profile?.centerId) {
          setCenterId(profile.centerId);
          await load(profile.centerId);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const createType = async () => {
    if (!centerId || !newName.trim() || !newDescription.trim()) return;
    setCreating(true);
    try {
      await requestTypeApiService.create({ name: newName.trim(), description: newDescription.trim(), centerId });
      setNewName('');
      setNewDescription('');
  await load(centerId);
      toast({ title: 'Created', description: 'Request type added' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to create type', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const deleteType = async (id: number | undefined, name: string) => {
    if (!id) { 
      toast({ title: 'Cannot delete', description: 'ID not available from API list', variant: 'destructive' });
      return;
    }
    if (!centerId) return;
    setDeletingId(id);
    try {
      await requestTypeApiService.delete(id);
      await load(centerId);
      toast({ title: 'Deleted', description: `Removed ${name}` });
    } catch (e: any) {
      // Assume failure likely due to FK constraint (in-use). Provide specific guidance.
      const status = e?.response?.status || e?.status;
      const baseMsg = 'Other senior requests are already using this type, so it cannot be deleted.';
      toast({
        title: 'Cannot delete',
        description: status === 409 ? baseMsg : baseMsg + ' If you believe this is an error, remove or reassign those requests first.',
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Types</CardTitle>
          <CardDescription>Global types are available to all centers (read-only). Custom types belong to your center.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Types Creation + List (on top) */}
          <div className="space-y-2 border rounded-md p-4 bg-muted/40">
            <div className="flex gap-2">
              <Input placeholder="New request type name *" value={newName} onChange={e => setNewName(e.target.value)} disabled={!centerId || creating} />
              <Button onClick={createType} disabled={!newName.trim() || !newDescription.trim() || !centerId || creating} variant="outline">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              </Button>
            </div>
            <Textarea placeholder="Description (required)" value={newDescription} onChange={e => setNewDescription(e.target.value)} disabled={!centerId || creating} className="min-h-[70px]" />
            <p className="text-[11px] text-muted-foreground">Provide a clear name and description. These are center-scoped.</p>
          </div>
          {/* Custom Types List */}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
          ) : customTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom types yet. Add one above.</p>
          ) : (
            <ul className="divide-y border rounded-md">
              {customTypes.map(t => (
                <li key={t.id} className="px-3 py-2 text-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t.name}</span>
                    <Button disabled={!t.id || deletingId === t.id} size="icon" variant="ghost" onClick={() => deleteType(t.id, t.name)}>
                      {deletingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground leading-snug line-clamp-3">{t.description}</p>}
                </li>
              ))}
            </ul>
          )}

          <div className="border-b" />

          {/* Global Types Section (now below) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Global Types</h3>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
            ) : globalTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No global types available.</p>
            ) : (
              <ul className="divide-y border rounded-md bg-muted/30">
                {globalTypes.map(t => (
                  <li key={t.id} className="px-3 py-2 text-sm flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">GLOBAL</span>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground leading-snug line-clamp-3">{t.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
