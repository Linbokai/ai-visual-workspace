import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopNav />
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}
