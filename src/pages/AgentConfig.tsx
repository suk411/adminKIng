import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAgentConfig, updateAgentConfig, setAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, RefreshCw } from 'lucide-react';

const AgentConfig = () => {
  const { token } = useAuth();
  const [rates, setRates] = useState<number[]>([0, 0, 0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadConfig = async () => {
    setAuthToken(token);
    setLoading(true);
    try {
      const res = await fetchAgentConfig();
      setRates(res.data.comRates || [0, 0, 0]);
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to load config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (rates.some((r) => r < 0 || r > 1)) {
      toast.error('Rates must be between 0 and 1');
      return;
    }
    setAuthToken(token);
    setSaving(true);
    try {
      const res = await updateAgentConfig(rates);
      setRates(res.data.comRates);
      toast.success(res.data.msg || 'Config updated');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to update config');
    } finally {
      setSaving(false);
    }
  };

  const updateRate = (index: number, value: string) => {
    const num = parseFloat(value);
    const newRates = [...rates];
    newRates[index] = isNaN(num) ? 0 : num;
    setRates(newRates);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Commission Rates</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure agent referral commission rates per level</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadConfig} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {['Level 1 (Direct)', 'Level 2', 'Level 3'].map((label, i) => (
              <div key={i} className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{label}</label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={rates[i]}
                  onChange={(e) => updateRate(i, e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">{(rates[i] * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loading size={16} /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentConfig;
