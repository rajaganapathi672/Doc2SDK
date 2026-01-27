import { Home, FolderCode, Terminal, Search, Bell, Plus, Globe } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: any) => void;
    onNewProject: () => void;
    endpointCount?: number;
}

export default function Layout({ children, activeTab, onTabChange, onNewProject, endpointCount }: LayoutProps) {
    const menuItems = [
        { icon: Home, label: 'Overview', id: 'overview' },
        { icon: Globe, label: 'Endpoints', id: 'endpoints' },
        { icon: Terminal, label: 'Playground', id: 'playground' },
        { icon: FolderCode, label: 'Results', id: 'results' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-main)', color: 'var(--gray-100)', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{
                width: '260px',
                height: '100%',
                backgroundColor: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--gray-700)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem 1rem'
            }}>
                <div style={{
                    padding: '0 0.5rem 2rem 0',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <img src="/logo.svg" alt="Doc2SDK" style={{ height: '56px', width: 'auto' }} />
                </div>

                <nav style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '1rem 0.5rem 0.5rem' }}>Main Menu</p>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: activeTab === item.id ? '1px solid var(--primary-500)' : '1px solid transparent',
                                    cursor: 'pointer',
                                    color: activeTab === item.id ? 'var(--gray-100)' : 'var(--gray-300)',
                                    backgroundColor: activeTab === item.id ? 'var(--gray-700)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    marginBottom: '0.25rem',
                                    textAlign: 'left'
                                }}
                            >
                                <Icon size={20} color={activeTab === item.id ? 'var(--primary-500)' : 'currentColor'} />
                                <span style={{ fontSize: '0.875rem', fontWeight: '500', flex: 1 }}>{item.label}</span>
                                {item.id === 'endpoints' && endpointCount !== undefined && endpointCount > 0 && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        backgroundColor: activeTab === 'endpoints' ? 'var(--primary-500)' : 'var(--gray-700)',
                                        color: activeTab === 'endpoints' ? 'var(--gray-100)' : 'var(--gray-300)',
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '10px',
                                        fontWeight: '700'
                                    }}>
                                        {endpointCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>


            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Header */}
                <header style={{ height: '64px', borderBottom: '1px solid var(--gray-700)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
                        <input
                            type="text"
                            placeholder="Search projects, SDKs, or docs..."
                            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--gray-700)', borderRadius: '8px', color: 'var(--gray-100)', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Bell size={20} color="var(--gray-500)" />
                        <button onClick={onNewProject} style={{ height: '36px', padding: '0 1rem', borderRadius: '8px', backgroundColor: 'var(--primary-600)', color: 'white', border: 'none', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <Plus size={18} /> New Project
                        </button>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};


