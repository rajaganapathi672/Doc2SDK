import { Link, useLocation } from 'react-router-dom';
import { Home, FolderCode, Terminal, Settings, CreditCard, HelpCircle } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: FolderCode, label: 'Projects', path: '/projects' },
        { icon: Terminal, label: 'Playground', path: '/playground' },
    ];

    const secondaryItems = [
        { icon: CreditCard, label: 'Subscription', path: '/billing' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: HelpCircle, label: 'Support', path: '/support' },
    ];

    return (
        <div className="sidebar" style={{
            width: '260px',
            height: '100%',
            backgroundColor: 'var(--bg-sidebar)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem'
        }}>
            <div className="logo" style={{
                padding: '0 0.5rem 2rem 0',
                display: 'flex',
                alignItems: 'center'
            }}>
                <img src="/logo.svg" alt="Doc2SDK" style={{ height: '56px', width: 'auto' }} />
            </div>

            <nav style={{ flex: 1 }}>
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--gray-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '1rem 0.5rem 0.5rem'
                }}>Main Menu</p>
                <div className="menu-group">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                color: location.pathname === item.path ? 'white' : 'var(--gray-400)',
                                textDecoration: 'none',
                                backgroundColor: location.pathname === item.path ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                transition: 'all 0.2s ease',
                                marginBottom: '0.25rem'
                            }}
                            className={location.pathname === item.path ? 'active' : ''}
                        >
                            <item.icon size={20} color={location.pathname === item.path ? 'var(--primary-500)' : 'currentColor'} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--gray-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '1.5rem 0.5rem 0.5rem'
                }}>Preferences</p>
                <div className="menu-group">
                    {secondaryItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                color: location.pathname === item.path ? 'white' : 'var(--gray-400)',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                marginBottom: '0.25rem'
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>


        </div>
    );
};

export default Sidebar;
