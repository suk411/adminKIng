import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchVipConfig, updateVipConfig, setAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';

interface VipLevel {
  name: string;
  minDeposit: number;
  dailyWithdrawLimit: number;
  monthlyCheckinBonus: number;
  upgradeReward: number;
}

const VipConfig = () => {
  const { token } = useAuth();
  const [levels, setLevels] = useState<VipLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadConfig = async () => {
    setAuthToken(token);
    setLoading(true);
    try {
      const res = await fetchVipConfig();
      setLevels(res.data.levels || []);
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
    setAuthToken(token);
    setSaving(true);
    try {
      const res = await updateVipConfig(levels);
      setLevels(res.data.levels);
      toast.success(res.data.msg || 'Config updated');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to update config');
    } finally {
      setSaving(false);
    }
  };

  const updateLevel = (index: number, field: keyof VipLevel, value: any) => {
    const newLevels = [...levels];
    newLevels[index] = { ...newLevels[index], [field]: field === 'name' ? value : Number(value) };
    setLevels(newLevels);
  };

  const addLevel = () => {
    setLevels([...levels, { name: `VIP ${levels.length + 1}`, minDeposit: 0, dailyWithdrawLimit: 0, monthlyCheckinBonus: 0, upgradeReward: 0 }]);
  };

  const removeLevel = (index: number) => {
    setLevels(levels.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">VIP Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure VIP levels with deposit limits and bonuses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadConfig} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={addLevel}>
            <Plus className="w-4 h-4" />
            Add Level
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 text-muted-foreground font-medium">Level Name</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Min Deposit</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Daily Withdraw Limit</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Monthly Check-in Bonus</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Upgrade Reward</th>
                  <th className="text-left p-3 text-muted-foreground font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <Input
                        value={level.name}
                        onChange={(e) => updateLevel(i, 'name', e.target.value)}
                        className="w-32 font-medium"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        min={0}
                        value={level.minDeposit}
                        onChange={(e) => updateLevel(i, 'minDeposit', e.target.value)}
                        className="w-32"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        min={0}
                        value={level.dailyWithdrawLimit}
                        onChange={(e) => updateLevel(i, 'dailyWithdrawLimit', e.target.value)}
                        className="w-32"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        min={0}
                        value={level.monthlyCheckinBonus}
                        onChange={(e) => updateLevel(i, 'monthlyCheckinBonus', e.target.value)}
                        className="w-32"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        min={0}
                        value={level.upgradeReward}
                        onChange={(e) => updateLevel(i, 'upgradeReward', e.target.value)}
                        className="w-32"
                      />
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLevel(i)}
                        disabled={levels.length <= 1}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end p-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VipConfig;
