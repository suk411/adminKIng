import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAgentDaily, setAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import SearchBar from '@/components/SearchBar';
import LastUpdated from '@/components/LastUpdated';
import Loading from '@/components/Loading';
import { Input } from '@/components/ui/input';

const AgentDaily = () => {
  const { token } = useAuth();
  const [userId, setUserId] = useState('');
  const [date, setDate] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadDaily = async () => {
    const q = userId.trim();
    if (!q) return;
    setAuthToken(token);
    setLoading(true);
    try {
      const res = await fetchAgentDaily(q, date || undefined);
      setData(res.data);
      setUpdatedAt(new Date());
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to load daily stats');
    } finally {
      setLoading(false);
    }
  };

  const LevelCard = ({ level, stats }: { level: string; stats: any }) => (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <h4 className="font-semibold text-foreground">{level}</h4>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Deposit</p>
          <p className="font-medium text-foreground">₹{(stats?.deposit ?? 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Commission</p>
          <p className="font-medium text-primary">₹{(stats?.commission ?? 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Count</p>
          <p className="font-medium text-foreground">{stats?.count ?? 0}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex-1">
          <SearchBar
            value={userId}
            onChange={setUserId}
            onSearch={loadDaily}
            placeholder="Enter Agent User ID"
            loading={loading}
          />
        </div>
        <div className="w-full sm:w-40">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
          />
        </div>
        <LastUpdated timestamp={updatedAt} onRefresh={loadDaily} loading={loading} />
      </div>

      {data && (
        <div className="space-y-4">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">User ID: {data.userId}</h3>
                <p className="text-sm text-muted-foreground">Date: {data.date}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LevelCard level="Level 1 (Direct)" stats={data.level1} />
            <LevelCard level="Level 2" stats={data.level2} />
            <LevelCard level="Level 3" stats={data.level3} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDaily;
