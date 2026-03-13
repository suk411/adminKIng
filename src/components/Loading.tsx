import { dotPulse } from 'ldrs';
dotPulse.register();

interface LoadingProps {
  size?: number;
  color?: string;
}

const Loading = ({ size = 43, color = 'currentColor' }: LoadingProps) => {
  return (
    <l-dot-pulse
      size={size}
      speed="1.3"
      color={color}
    />
  );
};

export default Loading;
