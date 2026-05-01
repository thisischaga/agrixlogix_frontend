// src/components/ui/Toast.jsx
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const icons = {
  success: <CheckCircle size={16} />,
  error:   <AlertCircle size={16} className="text-red-300" />,
  info:    <Info size={16} className="text-blue-300" />,
};

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast">
      {icons[toast.type] || icons.success}
      <span>{toast.message}</span>
    </div>
  );
}
