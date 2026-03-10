import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { searchUser, setAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import SearchBar from '@/components/SearchBar';
import LastUpdated from '@/components/LastUpdated';
import { ShieldAlert, ShieldCheck, Smartphone, Globe, Fingerprint } from 'lucide-react';

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

  const { user, account, deviceRisk } = result || {};

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <SearchBar value={userId} onChange={setUserId} onSearch={handleSearch} placeholder="Enter User ID" loading={loading} />
        <LastUpdated timestamp={updatedAt} onRefresh={handleSearch} loading={loading} />
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">User Profile</h3>
              <InfoRow label="User ID" value={user.userId} />
              <InfoRow label="Mobile" value={user.mobile} />
              <InfoRow label="Admin" value={user.admin ? 'Yes' : 'No'} />
              <InfoRow label="Created" value={new Date(user.createdAt).toLocaleString()} />
              <InfoRow label="Updated" value={new Date(user.updatedAt).toLocaleString()} />
            </div>
          )}
          {account && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Account</h3>
              <InfoRow label="Balance" value={`₹${account.balance?.toLocaleString()}`} />
              <InfoRow label="Currency" value={account.currency} />
              <InfoRow label="Status" value={account.status} />
              <InfoRow label="Created" value={new Date(account.createdAt).toLocaleString()} />
              <InfoRow label="Updated" value={new Date(account.updatedAt).toLocaleString()} />
            </div>
          )}
        </div>
      )}

      {deviceRisk && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Device Risk Assessment
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                deviceRisk.flagged 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {deviceRisk.flagged ? 'Flagged' : 'Safe'}
              </span>
              <span className="text-sm text-muted-foreground">
                Risk: {deviceRisk.latestRisk}/100 (Max: {deviceRisk.maxRisk})
              </span>
            </div>
          </div>

          {deviceRisk.signals && deviceRisk.signals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {deviceRisk.signals.map((signal: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                  {signal}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Device Info
              </h4>
              <InfoRow label="Device ID" value={deviceRisk.latest?.deviceId || '—'} />
              <InfoRow label="Fingerprint" value={deviceRisk.latest?.fingerprint || '—'} />
              <InfoRow label="Platform" value={deviceRisk.latest?.platform || '—'} />
              <InfoRow label="Browser" value={deviceRisk.latest?.browser || '—'} />
              <InfoRow label="OS" value={deviceRisk.latest?.os || '—'} />
              <InfoRow label="Resolution" value={deviceRisk.latest?.screenResolution || '—'} />
              <InfoRow label="Memory" value={deviceRisk.latest?.deviceMemory ? `${deviceRisk.latest.deviceMemory}GB` : '—'} />
            </div>

            <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" /> Network Info
              </h4>
              <InfoRow label="IP" value={deviceRisk.latest?.ip || '—'} />
              <InfoRow label="Country" value={deviceRisk.latest?.ipCountry || '—'} />
              <InfoRow label="City" value={deviceRisk.latest?.ipCity || '—'} />
              <InfoRow label="ISP" value={deviceRisk.latest?.isp || '—'} />
              <InfoRow label="ASN" value={deviceRisk.latest?.asn || '—'} />
              <InfoRow label="Proxy" value={deviceRisk.latest?.proxy ? 'Yes' : 'No'} />
              <InfoRow label="VPN" value={deviceRisk.latest?.vpnDetected ? 'Yes' : 'No'} />
            </div>

            <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Fingerprint className="w-4 h-4" /> Payment & Stats
              </h4>
              <InfoRow label="Payment Hash" value={deviceRisk.latest?.paymentMethodHash || '—'} />
              <InfoRow label="Last Seen" value={deviceRisk.latest?.at ? new Date(deviceRisk.latest.at).toLocaleString() : '—'} />
              <InfoRow label="Total Logs" value={deviceRisk.totalLogs || 0} />
            </div>
          </div>
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
