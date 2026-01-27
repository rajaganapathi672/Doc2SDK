import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Code, Play, RefreshCw, Zap, Target, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Active Projects', value: '0', icon: Box, color: 'var(--primary-500)' },
        { label: 'Generated SDKs', value: '0', icon: Code, color: 'var(--success)' },
        { label: 'Total Endpoints', value: '0', icon: Shield, color: 'var(--accent-purple)' },
        { label: 'API Calls', value: '0', icon: Zap, color: 'var(--warning)' },
    ]);
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        try {
            setLoading(true);
            const saved = localStorage.getItem('ag_projects');
            const projects = saved ? JSON.parse(saved) : [];
            setRecentProjects(projects.slice(0, 4));

            const totalProjects = projects.length;
            const totalEndpoints = projects.reduce((acc: number, p: any) => acc + (p.spec?.endpoints?.length || 0), 0);
            const savedCalls = localStorage.getItem('ag_api_calls');
            const totalCalls = savedCalls ? parseInt(savedCalls, 10) : 0;

            setStats([
                { label: 'Active Projects', value: totalProjects.toString(), icon: Box, color: 'var(--primary-500)' },
                { label: 'Generated SDKs', value: totalProjects.toString(), icon: Code, color: 'var(--success)' },
                { label: 'Total Endpoints', value: totalEndpoints.toString(), icon: Shield, color: 'var(--accent-purple)' },
                { label: 'API Calls', value: totalCalls.toString(), icon: Zap, color: 'var(--warning)' },
            ]);
        } catch (error) {
            console.error("Dashboard compute error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="dashboard-page">
            <div className="welcome-section" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Overview</h1>
                <p style={{ color: 'var(--gray-500)' }}>Welcome back to Doc2SDK. Here's what's happening today.</p>
            </div>

            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '1.25rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: `${stat.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: stat.color
                            }}>
                                <stat.icon size={22} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>+0%</span>
                        </div>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="recent-projects glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Recent Projects</h2>
                        <Link to="/projects" className="btn btn-outline" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>View All</Link>
                    </div>

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : recentProjects.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                            No projects found. <Link to="/projects" style={{ color: 'var(--primary-500)' }}>Create one</Link>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: 'var(--gray-500)', fontWeight: '500', fontSize: '0.875rem' }}>Project Name</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: 'var(--gray-500)', fontWeight: '500', fontSize: '0.875rem' }}>Source</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: 'var(--gray-500)', fontWeight: '500', fontSize: '0.875rem' }}>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProjects.map((project, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)' }}>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--gray-800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Target size={16} />
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{project.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.source_url}</span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-400)', fontSize: '0.875rem' }}>
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="quick-actions glass-card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Action Center</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to="/projects" className="btn btn-outline" style={{ justifyContent: 'flex-start', width: '100%', padding: '1rem', textDecoration: 'none' }}>
                            <RefreshCw size={18} />
                            <div style={{ textAlign: 'left', color: 'white' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Sync External Docs</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Keep your SDKs up to date</p>
                            </div>
                        </Link>
                        <Link to="/playground" className="btn btn-outline" style={{ justifyContent: 'flex-start', width: '100%', padding: '1rem', textDecoration: 'none' }}>
                            <Play size={18} />
                            <div style={{ textAlign: 'left', color: 'white' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Quick Playground</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Test endpoints instantly</p>
                            </div>
                        </Link>
                    </div>

                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pro Plan</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>Upgrade to unlock advanced AI models and priority generation.</p>
                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem' }}>Coming Soon</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
