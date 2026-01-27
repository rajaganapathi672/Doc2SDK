import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Globe, Terminal, Cpu, Zap, Copy, Check, Box, FileCode, Activity, Share2, Download, X } from 'lucide-react';
import { mvpApi } from '../api';
import Layout from '../components/Layout';

export default function Workspace() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any[]>(() => {
        const saved = localStorage.getItem('ag_projects');
        return saved ? JSON.parse(saved) : [];
    });
    const [result, setResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'playground' | 'results'>('overview');
    const [projectName, setProjectName] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Playground state
    const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
    const [pParams, setPParams] = useState<Record<string, string>>({});
    const [pBody, setPBody] = useState('');
    const [pResponse, setPResponse] = useState<any>(null);
    const [pLoading, setPLoading] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        try {
            const data = await mvpApi.generate(url);
            // Use user-provided name if available, otherwise fallback to API name
            const projectDisplayName = projectName || data.name;
            const newProject = { ...data, name: projectDisplayName, id: Date.now(), url };
            const updatedProjects = [newProject, ...projects];

            setProjects(updatedProjects);
            localStorage.setItem('ag_projects', JSON.stringify(updatedProjects));

            setResult(newProject);
            setActiveTab('results');
            setIsCreateModalOpen(false);
            setProjectName('');
            setUrl('');
            if (data.spec.endpoints && data.spec.endpoints.length > 0) {
                setSelectedEndpoint(data.spec.endpoints[0]);
            }
        } catch (error: any) {
            console.error("Generation failed:", error);
            alert("Error: " + (error.response?.data?.detail || "Failed to generate SDK"));
        } finally {
            setLoading(false);
        }
    };

    const selectProject = (p: any) => {
        setResult(p);
        setActiveTab('results');
        if (p.spec.endpoints && p.spec.endpoints.length > 0) {
            setSelectedEndpoint(p.spec.endpoints[0]);
        }
    };

    const handleNewProject = () => {
        setIsCreateModalOpen(true);
    };

    const handleExecute = async () => {
        if (!result || !selectedEndpoint) return;
        setPLoading(true);
        try {
            // Replace path parameters like {id} or {petId} in the path string
            let path = selectedEndpoint.path;
            const pathParams = selectedEndpoint.parameters?.path || [];
            pathParams.forEach((tp: any) => {
                const val = pParams[tp.name] || `{${tp.name}}`;
                path = path.replace(`{${tp.name}}`, val);
            });

            const response = await mvpApi.execute({
                base_url: result.spec.base_url,
                path: path,
                method: selectedEndpoint.method,
                params: pParams,
                json_body: pBody ? JSON.parse(pBody) : undefined
            });
            setPResponse(response);
        } catch (error: any) {
            setPResponse({ error: error.message || "Execution failed" });
        } finally {
            setPLoading(false);
        }
    };

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleParamChange = (key: string, value: string) => {
        setPParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Layout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onNewProject={handleNewProject}
            endpointCount={result?.spec?.endpoints?.length}
        >
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                        <div style={{ marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Overview</h1>
                            <p style={{ color: '#71717a' }}>Welcome back to Doc2SDK. Here's what's happening today.</p>
                        </div>

                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                            {[
                                { label: 'Active Projects', value: projects.length.toString(), icon: Box, color: '#3b82f6' },
                                { label: 'Generated SDKs', value: projects.length.toString(), icon: FileCode, color: '#10b981' },
                                { label: 'Total Endpoints', value: result ? result.spec.endpoints.length : '0', icon: Globe, color: '#8b5cf6' },
                                { label: 'API Calls', value: result ? '0' : '-', icon: Activity, color: '#f59e0b' }
                            ].map((stat, i) => (
                                <div key={i} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <stat.icon size={20} color={stat.color} />
                                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>+0%</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase' }}>{stat.label}</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</h3>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                            {/* Generate Area */}
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Create New Project</h2>
                                <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ backgroundColor: '#18181b', padding: '0.5rem', borderRadius: '12px', border: '1px solid #27272a' }}>
                                        <input
                                            type="text"
                                            placeholder="Project Name (Optional)"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ backgroundColor: '#18181b', padding: '0.5rem', borderRadius: '12px', border: '1px solid #27272a' }}>
                                        <input
                                            type="url"
                                            placeholder="Documentation URL (e.g. https://api.docs.com)"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: '48px' }}>
                                        {loading ? <Cpu className="animate-spin" size={18} /> : 'Generate SDK'}
                                    </button>
                                </form>
                            </div>

                            {/* Recent Projects */}
                            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    Recent Projects
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => { localStorage.removeItem('ag_projects'); setProjects([]); }}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >
                                            Clear
                                        </button>
                                        <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer' }}>View All</button>
                                    </div>
                                </h2>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {projects.length === 0 ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', fontSize: '0.9rem' }}>
                                            No projects found. Create one.
                                        </div>
                                    ) : (
                                        projects.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => selectProject(p)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px',
                                                    backgroundColor: '#18181b', border: '1px solid #27272a', color: 'white', textAlign: 'left', cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Box size={16} color="#3b82f6" />
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.1rem' }}>{p.name}</p>
                                                    <p style={{ fontSize: '0.7rem', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.url}</p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'endpoints' && (
                    <motion.div key="endpoints" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {!result ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <Globe size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                <h3>No endpoints found</h3>
                                <p style={{ color: '#71717a' }}>Generate a project first to see discovered endpoints.</p>
                            </div>
                        ) : (
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Discovered Endpoints</h2>
                                        <p style={{ color: '#71717a' }}>Found {result.spec.endpoints.length} endpoints for {result.name}</p>
                                    </div>
                                    <button onClick={() => setActiveTab('playground')} className="btn btn-primary">
                                        Open in Playground
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {result.spec.endpoints.map((ep: any, i: number) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem',
                                            padding: '1.25rem',
                                            backgroundColor: '#18181b',
                                            border: '1px solid #27272a',
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{
                                                width: '60px',
                                                textAlign: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: '900',
                                                color: ep.method === 'GET' ? '#10b981' : '#3b82f6',
                                                padding: '0.4rem',
                                                backgroundColor: ep.method === 'GET' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                borderRadius: '6px'
                                            }}>
                                                {ep.method}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>{ep.path}</p>
                                                <p style={{ fontSize: '0.85rem', color: '#71717a' }}>{ep.summary || 'No description available'}</p>
                                            </div>
                                            <button
                                                onClick={() => { setSelectedEndpoint(ep); setActiveTab('playground'); }}
                                                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.875rem', cursor: 'pointer', fontWeight: '500' }}
                                            >
                                                Test →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'results' && (
                    <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {!result ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <h3>No results yet.</h3>
                                <p style={{ color: '#71717a' }}>Go to Overview to generate your first SDK.</p>
                                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('overview')}>Back to Overview</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '1.5rem' }}>
                                {/* SDK Code */}
                                <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Code size={18} color="#3b82f6" />
                                            <span style={{ fontWeight: '600' }}>Python Client SDK</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => downloadFile(result.sdk_code, `${result.name.replace(/\s+/g, '_')}_sdk.py`, 'text/x-python')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Download size={16} /> Download
                                            </button>
                                            <button onClick={() => copyToClipboard(result.sdk_code)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                {copied ? <Check size={16} color="#10b981" /> : <><Copy size={16} /> Copy Code</>}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
                                        <pre style={{ margin: 0, padding: '1.5rem', backgroundColor: '#09090b', color: '#e5e7eb', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                            {result.sdk_code}
                                        </pre>
                                    </div>
                                </div>

                                {/* Spec JSON */}
                                <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Globe size={18} color="#8b5cf6" />
                                            <span style={{ fontWeight: '600' }}>Extracted Spec</span>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(JSON.stringify(result.spec, null, 2), `${result.name.replace(/\s+/g, '_')}_spec.json`, 'application/json')}
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                        >
                                            <Download size={16} /> Download JSON
                                        </button>

                                    </div>
                                    <div style={{ flex: 1, maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
                                        <pre style={{ margin: 0, padding: '1.5rem', backgroundColor: '#09090b', color: '#a1a1aa', fontSize: '0.8rem' }}>
                                            {JSON.stringify(result.spec, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'playground' && (
                    <motion.div key="playground" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {!result ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <Terminal size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                <h3>Playground is locked</h3>
                                <p style={{ color: '#71717a' }}>Generate a project first to test endpoints.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr) 400px', gap: '1.5rem', height: 'calc(100vh - 200px)' }}>
                                {/* Endpoints List */}
                                <div className="glass-card" style={{ padding: '1rem', overflowY: 'auto' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', marginBottom: '1rem' }}>Endpoints</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {result.spec.endpoints.map((ep: any, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => { setSelectedEndpoint(ep); setPParams({}); setPResponse(null); }}
                                                style={{
                                                    display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px',
                                                    border: selectedEndpoint === ep ? '1px solid #3b82f6' : '1px solid transparent',
                                                    backgroundColor: selectedEndpoint === ep ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                    color: selectedEndpoint === ep ? 'white' : '#a1a1aa', textAlign: 'left', cursor: 'pointer'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.6rem', fontWeight: '800', width: '36px', color: ep.method === 'GET' ? '#10b981' : '#3b82f6' }}>{ep.method}</span>
                                                <span style={{ fontSize: '0.8rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.path}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Request Editor */}
                                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                                        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '0.75rem 1rem', borderRadius: '8px', color: '#3b82f6', fontWeight: '800', fontSize: '0.8rem' }}>{selectedEndpoint?.method || 'GET'}</div>
                                        <input readOnly value={selectedEndpoint?.path || ''} style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a', padding: '0.75rem 1rem', borderRadius: '8px', color: 'white', fontSize: '0.875rem' }} />
                                        <button onClick={handleExecute} disabled={pLoading} className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
                                            {pLoading ? '...' : <><Zap size={16} /> Send</>}
                                        </button>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        <h3 style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: '#e5e7eb' }}>Parameters</h3>

                                        {/* Dynamic Parameters from Spec */}
                                        {selectedEndpoint?.parameters && Object.entries(selectedEndpoint.parameters).map(([type, list]: [string, any]) => (
                                            list.length > 0 && (
                                                <div key={type} style={{ marginBottom: '1.5rem' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{type} params</p>
                                                    {list.map((p: any) => (
                                                        <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                                            <label style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{p.name}{p.required ? '*' : ''}</label>
                                                            <input
                                                                type="text"
                                                                placeholder={p.type || 'string'}
                                                                value={pParams[p.name] || ''}
                                                                onChange={(e) => handleParamChange(p.name, e.target.value)}
                                                                style={{ padding: '0.5rem', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', color: 'white', fontSize: '0.8rem' }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        ))}

                                        {/* Fallback for simple JSON params if no structured params found */}
                                        {(!selectedEndpoint?.parameters || (Object.values(selectedEndpoint?.parameters).every(l => (l as any).length === 0))) && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', marginBottom: '0.5rem' }}>Request Body / Params (JSON)</label>
                                                <textarea
                                                    value={pBody}
                                                    onChange={(e) => setPBody(e.target.value)}
                                                    placeholder='{"key": "value"}'
                                                    style={{ width: '100%', height: '120px', backgroundColor: '#09090b', color: 'white', border: '1px solid #27272a', padding: '0.75rem', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Response Viewer */}
                                <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #27272a', color: '#71717a', fontSize: '0.8rem' }}>Response</div>
                                    <div style={{ flex: 1, padding: '1rem', backgroundColor: '#09090b', overflow: 'auto' }}>
                                        {pResponse ? (
                                            <pre style={{ margin: 0, fontSize: '0.8rem', color: pResponse.error ? '#ef4444' : '#10b981' }}>
                                                {JSON.stringify(pResponse, null, 2)}
                                            </pre>
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', textAlign: 'center' }}>
                                                <Share2 size={32} style={{ marginBottom: '1rem' }} />
                                                <p style={{ fontSize: '0.875rem' }}>Send request to see live response</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Create Project Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', position: 'relative' }}>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create New Project</h2>
                            <p style={{ color: '#71717a', marginBottom: '2rem', fontSize: '0.9rem' }}>Enter the details below to generate a new SDK.</p>

                            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: '500' }}>PROJECT NAME</label>
                                    <div style={{ backgroundColor: '#18181b', padding: '0.25rem', borderRadius: '10px', border: '1px solid #27272a' }}>
                                        <input
                                            type="text"
                                            placeholder="e.g. Stripe Payment API"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: '500' }}>DOCUMENTATION URL</label>
                                    <div style={{ backgroundColor: '#18181b', padding: '0.25rem', borderRadius: '10px', border: '1px solid #27272a' }}>
                                        <input
                                            type="url"
                                            placeholder="https://api.example.com/docs"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline" style={{ flex: 1, height: '52px' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, height: '52px', fontSize: '1rem', fontWeight: '700' }}>
                                        {loading ? <Cpu className="animate-spin" size={20} /> : 'Generate SDK'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
}


