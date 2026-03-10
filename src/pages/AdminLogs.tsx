import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminLogs, setAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

const AdminLogs = () => {
  const { token } = useAuth();
  const [level, setLevel] = useState<'info' | 'error' | ''>('');
  const [since, setSince] = useState('');
  const [limit, setLimit] = useState(200);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = async () => {
    setAuthToken(token);
    setLoading(true);
    try {
      const params: any = {};
      if (level) params.level = level;
      if (since) params.since = since;
      if (limit) params.limit = limit;
      const res = await fetchAdminLogs(params);
      setLogs(res.data.entries || []);
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const toggleExpand = (ts: string) => {
    setExpandedId(expandedId === ts ? null : ts);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as '' | 'info' | 'error')}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="">All</option>
              <option value="info">Info</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Since</label>
            <Input
              type="datetime-local"
              value={since}
              onChange={(e) => setSince(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Limit</label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <Button onClick={loadLogs} disabled={loading} variant="outline">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Apply
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-secondary/50">
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium w-10"></th>
                <th className="text-left p-3 text-muted-foreground font-medium">Time</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Level</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Message</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    {loading ? 'Loading...' : 'No logs found'}
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => {
                  const logKey = log.ts + i;
                  const isExpanded = expandedId === logKey;
                  return (
                    <>
                      <tr
                        key={logKey}
                        className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(logKey)}
                      >
                        <td className="p-3">
                          {log.stack ? (
                            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                          ) : null}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{formatTime(log.ts)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              log.level === 'error'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td className="p-3 text-foreground font-mono text-xs">{log.message}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {log.meta?.method} {log.meta?.path} {log.meta?.status && `(${log.meta.status})`}
                        </td>
                      </tr>
                      {isExpanded && log.stack && (
                        <tr className="bg-destructive/5">
                          <td colSpan={5} className="p-3">
                            <pre className="text-xs text-destructive font-mono whitespace-pre-wrap bg-black/50 p-3 rounded">
                              {log.stack}
                            </pre>
                          </td>
                        </tr>
                      )}
                      {isExpanded && log.meta && !log.stack && (
                        <tr className="bg-secondary/20">
                          <td colSpan={5} className="p-3">
                            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {logs.length} entries
      </div>
    </div>
  );
};

export default AdminLogs;
