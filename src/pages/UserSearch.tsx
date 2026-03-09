import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { searchUser, setAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import SearchBar from '@/components/SearchBar';
import LastUpdated from '@/components/LastUpdated';

const UserSearch = () => {
  const { token } = useAuth();
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const handleSearch = async () => {
    if (!userId.trim()) return;
    setAuthToken(token);
    setLoading(true);
    setResult(null);
    try {
      const res = await searchUser(userId.trim());
      setResult(res.data);
      setUpdatedAt(new Date());
    } catch (err: any) {
      toast.error(err.response?.data?.msg || err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <SearchBar value={userId} onChange={setUserId} onSearch={handleSearch} placeholder="Enter User ID" loading={loading} />
        <LastUpdated timestamp={updatedAt} onRefresh={handleSearch} loading={loading} />
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.user && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">User Profile</h3>
              <InfoRow label="User ID" value={result.user.userId} />
              <InfoRow label="Mobile" value={result.user.mobile} />
              <InfoRow label="Admin" value={result.user.admin ? 'Yes' : 'No'} />
              <InfoRow label="Created" value={new Date(result.user.createdAt).toLocaleString()} />
              <InfoRow label="Updated" value={new Date(result.user.updatedAt).toLocaleString()} />
            </div>
          )}
          {result.account && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Account</h3>
              <InfoRow label="Balance" value={`₹${result.account.balance?.toLocaleString()}`} />
              <InfoRow label="Currency" value={result.account.currency} />
              <InfoRow label="Status" value={result.account.status} />
              <InfoRow label="Created" value={new Date(result.account.createdAt).toLocaleString()} />
              <InfoRow label="Updated" value={new Date(result.account.updatedAt).toLocaleString()} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between items-center py-1 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{String(value ?? '—')}</span>
  </div>
);

export default UserSearch;
