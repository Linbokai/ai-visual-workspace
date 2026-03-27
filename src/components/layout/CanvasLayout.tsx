import { Outlet } from 'react-router-dom';

export function CanvasLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--background)]">
      <Outlet />
    </div>
  );
}
