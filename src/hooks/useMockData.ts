import { useEffect } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { mockProjects } from '@/lib/mock-data';

/**
 * Initialize stores with mock data for development.
 * Remove this when real API is connected.
 */
export function useMockData() {
  const projects = useProjectStore((s) => s.projects);
  const setProjects = useProjectStore((s) => s.setProjects);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // Set demo user if authenticated but no user object
    if (!user && localStorage.getItem('auth_token')) {
      setUser({
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
      });
    }
  }, [user, setUser]);

  useEffect(() => {
    // Load mock projects if store is empty
    if (projects.length === 0) {
      setProjects(mockProjects);
    }
  }, [projects.length, setProjects]);
}
