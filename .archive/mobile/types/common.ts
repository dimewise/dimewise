import type { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface FormModalProps<T> extends ModalProps {
  data?: T | null;
  onSubmit: (data: T) => Promise<void>;
  isLoading?: boolean;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
