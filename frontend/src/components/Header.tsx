import { Search, Bell } from 'lucide-react';

const Header = () => {
    return (
        <header style={{
            height: '64px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            backgroundColor: 'rgba(10, 10, 12, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 10
        }}>
            <div className="search-bar" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                width: '400px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <Search size={18} color="var(--gray-500)" />
                <input
                    type="text"
                    placeholder="Search projects, SDKs, or docs..."
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.875rem'
                    }}
                />
                <div style={{
                    padding: '2px 6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--gray-400)'
                }}>⌘K</div>
            </div>

            <div className="header-actions" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <button className="btn btn-outline" style={{ border: 'none', padding: '0.5rem' }}>
                    <Bell size={20} />
                </button>
                <div style={{
                    height: '24px',
                    width: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    margin: '0 0.5rem'
                }}></div>
                <button className="btn btn-primary">
                    + New Project
                </button>
            </div>
        </header>
    );
};

export default Header;
