import { RefreshCw } from 'lucide-react';

interface LastUpdatedProps {
  timestamp: Date | null;
  onRefresh?: () => void;
  loading?: boolean;
}

const LastUpdated = ({ timestamp, onRefresh, loading }: LastUpdatedProps) => {
  if (!timestamp) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Updated: {timestamp.toLocaleTimeString()}</span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="hover:text-foreground transition-colors p-1 rounded hover:bg-secondary"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default LastUpdated;
