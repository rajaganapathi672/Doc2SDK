import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, ExternalLink, Code, X } from 'lucide-react';
import { projectApi } from '../api';

export default function Projects() {
    const [searchQuery, setSearchQuery] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', source_url: '', source_type: 'openapi' });

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectApi.list();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await projectApi.create(newProject.name, newProject.source_url, newProject.source_type);
            setIsModalOpen(false);
            setNewProject({ name: '', source_url: '', source_type: 'openapi' });
            fetchProjects();
        } catch (error) {
            console.error("Failed to create project:", error);
            alert("Failed to create project. Make sure the URL is accessible.");
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="projects-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Projects</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Manage and monitor your API integration projects.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Create New Project
                </button>
            </div>

            <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem 0.625rem 2.5rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none'
                        }}
                    />
                </div>
                <button className="btn btn-outline" onClick={fetchProjects}>
                    <Filter size={18} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>No projects yet</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Start by creating your first API integration project.</p>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create Project</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card"
                            style={{ position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    color: 'var(--primary-500)',
                                    fontWeight: '600'
                                }}>
                                    {project.source_type || 'OpenAPI'}
                                </span>
                                <button style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer' }}>
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{project.name}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {project.source_url}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Code size={16} color="var(--gray-500)" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>SDKs available</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.875rem' }}>
                                    View SDKs
                                </button>
                                <a
                                    href={project.source_url}
                                    target="_blank"
                                    className="btn btn-outline"
                                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                                >
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '0.5rem' }}>Create New Project</h2>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Add an API documentation source to generate SDKs.</p>

                        <form onSubmit={handleCreateProject}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Project Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Stripe API"
                                    value={newProject.name}
                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>OpenAPI Spec URL (JSON/YAML)</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://example.com/openapi.json"
                                    value={newProject.source_url}
                                    onChange={e => setNewProject({ ...newProject, source_url: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Project</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};


