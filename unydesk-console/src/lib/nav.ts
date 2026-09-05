import type { LucideIcon } from 'lucide-react';
import {
  Monitor,
  MonitorSmartphone,
  Rocket,
  Users,
} from 'lucide-react';

export type NavChild = {
  href: string;
  label: string;
  end?: boolean;
};

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string | number;
  children?: NavChild[];
};

export type NavGroup = {
  caption: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    caption: 'Operação',
    items: [
      {
        id: 'devices',
        label: 'Dispositivos',
        href: '/devices',
        icon: Monitor,
        end: true,
      },
      {
        id: 'remote',
        label: 'Remoto',
        href: '/remote',
        icon: MonitorSmartphone,
      },
    ],
  },
  {
    caption: 'Administração',
    items: [
      {
        id: 'users',
        label: 'Usuários',
        href: '/users',
        icon: Users,
        end: true,
      },
      {
        id: 'deploy',
        label: 'Deploy',
        href: '/deploy',
        icon: Rocket,
        end: true,
      },
    ],
  },
];

export type SearchHit = {
  href: string;
  label: string;
  group: string;
};

export function searchNav(q: string): SearchHit[] {
  const needle = q.trim().toLowerCase();
  const hits: SearchHit[] = [];
  for (const g of navGroups) {
    for (const item of g.items) {
      if (item.href && (!needle || item.label.toLowerCase().includes(needle))) {
        hits.push({ href: item.href, label: item.label, group: g.caption });
      }
      for (const child of item.children || []) {
        if (!needle || child.label.toLowerCase().includes(needle)) {
          hits.push({ href: child.href, label: child.label, group: g.caption });
        }
      }
    }
  }
  return hits.slice(0, 12);
}
