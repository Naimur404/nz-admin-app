import { Colors } from '@/constants/theme';
import { useTheme } from './use-theme';

export const useThemeColors = () => {
  const { theme } = useTheme();
  return Colors[theme];
};