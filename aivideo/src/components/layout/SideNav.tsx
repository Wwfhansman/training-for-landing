'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useProjectStore } from '@/store/useProjectStore';

const SideNav: React.FC = () => {
  const pathname = usePathname();
  const { project } = useProjectStore();

  const menuItems = [
    { 
      name: '灵感剧本', 
      href: '/script', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    },
    { 
      name: '资产管理', 
      href: '/assets', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8V21H3V8"></path>
          <path d="M1 3H23V8H1V3Z"></path>
          <path d="M10 12H14"></path>
        </svg>
      )
    },
    { 
      name: '分镜编辑', 
      href: '/storyboard', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      )
    },
    { 
      name: '视频渲染', 
      href: '/render', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      )
    },
  ];

  return (
    <aside className="glass-panel" style={{
      position: 'fixed',
      top: '64px',
      left: 0,
      bottom: 0,
      width: '240px',
      padding: 'var(--spacing-6) 0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 900,
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none',
    }}>
      <div style={{ padding: '0 var(--spacing-6) var(--spacing-4)' }}>
        <h2 style={{ 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          color: 'var(--on-surface-variant)',
          marginBottom: 'var(--spacing-4)'
        }}>
          Project Console
        </h2>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-4)',
                padding: 'var(--spacing-4) var(--spacing-6)',
                color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                background: isActive ? 'rgba(192, 193, 255, 0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'var(--transition-fast)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 'var(--spacing-6)', borderTop: '1px solid var(--outline-variant)' }}>
        <button 
          className="btn-secondary" 
          style={{ width: '100%', fontSize: '0.85rem', marginBottom: 'var(--spacing-3)', borderColor: 'rgba(255,100,100,0.2)', opacity: 0.7 }}
          disabled={!project}
          onClick={async () => {
            if (project && confirm('确认重置所有正在进行的生成状态吗？（仅重置状态显示，不影响已生成的资源）')) {
               const res = await fetch('/api/project/reset-status', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ projectId: project.id }),
               });
               if (res.ok) window.location.reload();
            }
          }}
        >
          重置卡住的状态
        </button>
        <button 
          className="btn-primary" 
          style={{ width: '100%', fontSize: '0.85rem' }}
          onClick={() => window.open('/api/project/export', '_blank')}
        >
          导出项目
        </button>
        <p style={{ 
          marginTop: 'var(--spacing-4)', 
          fontSize: '0.75rem', 
          color: 'var(--outline)', 
          textAlign: 'center' 
        }}>
          帮助中心
        </p>
      </div>
    </aside>
  );
};

export default SideNav;
