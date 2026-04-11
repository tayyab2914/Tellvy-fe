import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link2, Search } from 'lucide-react';

export default function AdminRedirects() {
  const [redirects, setRedirects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/redirects').then(r => setRedirects(r.data)).catch(() => {});
  }, []);

  const filtered = redirects.filter(r =>
    r.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.standee_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6" data-testid="admin-redirects-page">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Dynamic Redirects</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage NFC/QR standee redirect destinations</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by business or standee ID..."
          className="rounded-sm pl-10 border-zinc-200"
          data-testid="redirect-search-input"
        />
      </div>

      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200">
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Standee ID</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Business</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Redirect URL</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-zinc-500">No redirects configured</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id} className="border-zinc-100" data-testid={`redirect-row-${r.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
                      <code className="text-xs bg-zinc-100 px-2 py-1 rounded-sm font-mono">/s/{r.standee_id}</code>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#09090B]">{r.business_name}</TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-600 truncate block max-w-[300px]">{r.redirect_url || 'Not configured'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.is_active ? 'default' : 'destructive'} className={`rounded-sm text-xs ${r.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}>
                      {r.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
