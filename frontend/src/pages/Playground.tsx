import { useState, useEffect } from 'react';
import { Send, Globe } from 'lucide-react';
import { projectApi, playgroundApi } from '../api';

const Playground = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [endpoints, setEndpoints] = useState<any[]>([]);
    const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
    const [params] = useState<Record<string, string>>({});
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectApi.list();
                setProjects(data);
                if (data.length > 0) {
                    handleSelectProject(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            }
        };
        fetchProjects();
    }, []);

    const handleSelectProject = async (projectId: string) => {
        try {
            const data = await projectApi.get(projectId);
            setSelectedProject(data);
            setEndpoints(data.endpoints || []);
            if (data.endpoints && data.endpoints.length > 0) {
                setSelectedEndpoint(data.endpoints[0]);
            }
        } catch (error) {
            console.error("Failed to fetch project details:", error);
        }
    };

    const handleTest = async () => {
        if (!selectedProject || !selectedEndpoint) return;

        setLoading(true);
        try {
            const data = await playgroundApi.test(selectedProject.id, selectedEndpoint.path, params);
            setResponse(data.response);
        } catch (error) {
            console.error("Test failed:", error);
            setResponse({ error: "Failed to execute test request" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="playground-page">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>API Playground</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Test endpoints and inspect responses in real-time.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Project:</span>
                    <select
                        onChange={(e) => handleSelectProject(e.target.value)}
                        value={selectedProject?.id || ''}
                        style={{
                            backgroundColor: 'var(--gray-800)',
                            color: 'white',
                            border: '1px solid var(--gray-700)',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            outline: 'none'
                        }}
                    >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 1fr', gap: '1.5rem', height: 'calc(100vh - 220px)' }}>
                {/* Endpoints Sidebar */}
                <div className="glass-card" style={{ padding: '1rem', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Endpoints</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {endpoints.map((ep, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedEndpoint(ep)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    backgroundColor: selectedEndpoint === ep ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    border: selectedEndpoint === ep ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                                    color: selectedEndpoint === ep ? 'white' : 'var(--gray-400)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{
                                    fontSize: '0.625rem',
                                    fontWeight: '800',
                                    width: '32px',
                                    color: ep.method === 'GET' ? 'var(--success)' : ep.method === 'POST' ? 'var(--primary-500)' : 'var(--warning)'
                                }}>{ep.method}</span>
                                <span style={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.summary || ep.path}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Request Panel */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            backgroundColor: 'var(--gray-800)',
                            color: selectedEndpoint?.method === 'GET' ? 'var(--success)' : 'var(--primary-500)',
                            border: '1px solid var(--gray-700)',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            fontWeight: '800',
                            fontSize: '0.75rem'
                        }}>
                            {selectedEndpoint?.method || 'POST'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                readOnly
                                value={selectedEndpoint?.path || '/'}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--gray-700)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleTest}
                            disabled={loading || !selectedEndpoint}
                            style={{ minWidth: '100px' }}
                        >
                            {loading ? 'Sending...' : <><Send size={18} /> Send</>}
                        </button>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--gray-800)', marginBottom: '1rem' }}>
                            <button style={{ padding: '0.5rem 0', color: 'white', borderBottom: '2px solid var(--primary-500)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Parameters</button>
                        </div>

                        <div className="params-list" style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                                {selectedEndpoint?.description || 'No description available for this endpoint.'}
                            </p>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Key</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '0.5rem' }}><input type="text" placeholder="key_name" style={{ width: '100%', padding: '0.5rem', background: 'none', border: '1px solid var(--gray-700)', borderRadius: '4px', color: 'white' }} /></td>
                                        <td style={{ padding: '0.5rem' }}><input type="text" placeholder="value" style={{ width: '100%', padding: '0.5rem', background: 'none', border: '1px solid var(--gray-700)', borderRadius: '4px', color: 'white' }} /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Response Panel */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-800)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>Response</h3>
                        {response && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <span style={{ fontSize: '0.75rem', color: response.error ? 'var(--error)' : 'var(--success)', fontWeight: '600' }}>
                                    {response.status_code || (response.error ? 'Error' : '200 OK')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, backgroundColor: 'var(--code-bg)', padding: '1.5rem', overflowY: 'auto', color: 'var(--code-text)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                        {loading ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)' }}>
                                <div className="spinner" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid var(--primary-500)', borderRadius: '50%', width: '24px', height: '24px' }}></div>
                            </div>
                        ) : response ? (
                            <pre style={{ margin: 0 }}>{JSON.stringify(response, null, 2)}</pre>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-600)', textAlign: 'center' }}>
                                <Globe size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p>Send a request to see the response here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playground;
