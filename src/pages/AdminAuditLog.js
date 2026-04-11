import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollText } from 'lucide-react';

const ACTION_COLORS = {
  created_client: 'bg-blue-100 text-blue-700',
  created_rep: 'bg-violet-100 text-violet-700',
  uploaded_staff: 'bg-emerald-100 text-emerald-700',
  kill_switch: 'bg-red-100 text-red-700',
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/audit-logs').then(r => setLogs(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6" data-testid="admin-audit-log-page">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Audit Log</h1>
        <p className="text-sm text-zinc-500 mt-1">Track all Account Rep actions for QC</p>
      </div>

      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200">
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Timestamp</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">User</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Action</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-zinc-500">No audit logs yet</TableCell></TableRow>
              ) : logs.map(log => (
                <TableRow key={log.id} className="border-zinc-100" data-testid={`audit-log-${log.id}`}>
                  <TableCell className="text-sm text-zinc-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#09090B]">{log.user_name}</TableCell>
                  <TableCell>
                    <Badge className={`rounded-sm text-xs ${ACTION_COLORS[log.action] || 'bg-zinc-100 text-zinc-700'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-600 max-w-md truncate">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
