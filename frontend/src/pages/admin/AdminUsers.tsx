import { useEffect, useState, useCallback } from 'react';
import { Search, UserPlus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { userService } from '@/services/userService';
import { formatDate } from '@/utils';
import type { User } from '@/types';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await userService.getAll(0, 100);
      setUsers(page.content);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = useCallback(async () => {
    if (!search.trim()) { load(); return; }
    try {
      setUsers(await userService.search(search));
    } catch { toast.error('Search failed'); }
  }, [search, load]);

  const toggleStatus = async (u: User) => {
    try {
      const updated = await userService.toggleStatus(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      toast.success(`User ${updated.enabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Action failed'); }
  };

  const deleteUser = async () => {
    if (!deleting) return;
    setActionLoading(true);
    try {
      await userService.delete(deleting.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
      toast.success('User deleted');
      setDeleting(null);
    } catch { toast.error('Delete failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Badge variant="secondary">{users.length} total</Badge>
      </div>

      <Card>
        <CardContent className="p-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, email…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <Button variant="outline" onClick={handleSearch}>Search</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.roles.map((r) => (
                        <Badge key={r} variant="outline" className="mr-1 text-[10px]">
                          {r.replace('ROLE_', '')}
                        </Badge>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.enabled ? 'success' : 'destructive'} className={u.enabled ? 'bg-green-100 text-green-800' : ''}>
                        {u.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => toggleStatus(u)} title={u.enabled ? 'Disable' : 'Enable'}>
                        {u.enabled ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleting(u)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No users found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete User"
        description={`Delete ${deleting?.fullName}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={actionLoading}
        onConfirm={deleteUser}
      />
    </div>
  );
}
