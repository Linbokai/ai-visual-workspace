import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotificationStore, type NotificationType } from '@/stores/notificationStore';

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<NotificationType, string> = {
  success: 'var(--success)',
  error: 'var(--error)',
  info: 'var(--info)',
  warning: 'var(--warning)',
};

export function ToastContainer() {
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Toast key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ notification }: { notification: { id: string; type: NotificationType; title: string; message?: string; duration?: number; action?: { label: string; onClick: () => void } } }) {
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const Icon = iconMap[notification.type];
  const color = colorMap[notification.type];
  const [progress, setProgress] = useState(100);
  const duration = notification.duration ?? 4000;

  useEffect(() => {
    if (duration <= 0) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="pointer-events-auto w-80 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-3">
        <div className="flex-shrink-0 mt-0.5" style={{ color }}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)] leading-tight">
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <button
              onClick={() => {
                notification.action!.onClick();
                removeNotification(notification.id);
              }}
              className="mt-1.5 text-xs font-medium cursor-pointer bg-transparent border-none px-0 py-0 hover:underline"
              style={{ color }}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 p-0.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-0.5 bg-[var(--border)]">
          <div
            className="h-full transition-none"
            style={{
              width: `${progress}%`,
              backgroundColor: color,
              opacity: 0.6,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
