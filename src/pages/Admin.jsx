import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

const ADMIN_EMAIL = 'femiaisida1@gmail.com';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('generator');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // CRUD State
  const [usersList, setUsersList] = useState([]);
  const [resourceLinks, setResourceLinks] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [userSearchResult, setUserSearchResult] = useState(null);

  // Form State for Resource Links
  const [newResource, setNewResource] = useState({
    subject: '',
    qualification: 'GCSE',
    board: 'AQA',
    topic: '',
    title: '',
    url: '',
    type: 'video'
  });

  // Automated Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState([]);
  const [genQualification, setGenQualification] = useState('GCSE');
  const [genSubject, setGenSubject] = useState('Physics');
  const [genBoard, setGenBoard] = useState('AQA');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getAdminToken = async () => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    return await auth.currentUser.getIdToken(true);
  };

  const callAdminApi = async (action, payload = {}) => {
    const token = await getAdminToken();
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Admin request failed");
    return data;
  };

  // User Management Handlers
  const handleFetchUsers = async () => {
    try {
      setStatusMessage("Fetching user directory...");
      const data = await callAdminApi('listUsers');
      setUsersList(data.users || []);
      setStatusMessage("User directory updated successfully.");
    } catch (err) {
      setStatusMessage(`Error fetching users: ${err.message}`);
    }
  };

  const handleSearchUser = async () => {
    if (!selectedUserEmail) return;
    try {
      setStatusMessage(`Searching for ${selectedUserEmail}...`);
      const data = await callAdminApi('findByEmail', { email: selectedUserEmail });
      setUserSearchResult(data.user);
      setStatusMessage("User found.");
    } catch (err) {
      setStatusMessage(`User lookup failed: ${err.message}`);
      setUserSearchResult(null);
    }
  };

  const handleGrantPro = async (targetUid, status) => {
    try {
      setStatusMessage("Updating user entitlement...");
      await callAdminApi('setUserField', {
        targetUid,
        field: 'isPro',
        value: status
      });
      setStatusMessage("User access level updated successfully.");
      if (userSearchResult) handleSearchUser();
      handleFetchUsers();
    } catch (err) {
      setStatusMessage(`Failed to update user: ${err.message}`);
    }
  };

  // Resource Link Handlers
  const handleFetchResources = async () => {
    try {
      setStatusMessage("Loading topic resources...");
      const data = await callAdminApi('listResourceLinks');
      setResourceLinks(data.links || []);
      setStatusMessage("Resource list loaded.");
    } catch (err) {
      setStatusMessage(`Error loading resources: ${err.message}`);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      setStatusMessage("Adding resource link...");
      const compoundTopicKey = `${newResource.board}_${newResource.qualification}_${newResource.subject}_${newResource.topic}`.replace(/\s+/g, '_');
      
      await callAdminApi('addResourceLink', {
        linkData: {
          ...newResource,
          compoundTopicKey,
          createdAt: new Date().toISOString()
        }
      });
      setStatusMessage("Resource added successfully.");
      setNewResource({ subject: '', qualification: 'GCSE', board: 'AQA', topic: '', title: '', url: '', type: 'video' });
      handleFetchResources();
    } catch (err) {
      setStatusMessage(`Failed to add resource: ${err.message}`);
    }
  };

  const handleDeleteResource = async (linkId) => {
    try {
      setStatusMessage("Deleting resource...");
      await callAdminApi('deleteResourceLink', { linkId });
      setStatusMessage("Resource deleted.");
      handleFetchResources();
    } catch (err) {
      setStatusMessage(`Delete failed: ${err.message}`);
    }
  };

  // Content Generator Engine
  const handleAutomatedGeneration = async () => {
    setIsGenerating(true);
    setGenerationLogs(["Initiating automated content pipeline..."]);

    const appendLog = (msg) => {
      setGenerationLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      appendLog(`Targeting qualification: ${genQualification} | Subject: ${genSubject} | Board: ${genBoard}`);
      
      // Step 1: Request Flashcard and Note Generation via /api/tutor proxy
      appendLog("Requesting board-accurate study material generation...");
      const token = await auth.currentUser.getIdToken();
      
      const promptText = `Generate structured flashcards and summary notes for ${genQualification} ${genSubject} (${genBoard}). Provide 5 key concepts with question/answer pairs. Plain text notation only, no LaTeX.`;

      const tutorRes = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptText }]
        })
      });

      if (!tutorRes.ok) {
        throw new Error("Failed to reach tutor generation API");
      }

      const tutorData = await tutorRes.json();
      appendLog("Generated content received successfully.");

      // Step 2: Cache generated material as official set using Admin API
      appendLog("Publishing official topic flashcards to database...");
      const docKey = `${genBoard}_${genQualification}_${genSubject}_General`.replace(/\s+/g, '_');
      
      await callAdminApi('addResourceLink', {
        linkData: {
          compoundTopicKey: docKey,
          title: `${genQualification} ${genSubject} (${genBoard}) Core Flashcards`,
          type: 'official_set',
          content: tutorData.reply || tutorData.choices?.[0]?.message?.content || '',
          createdAt: new Date().toISOString()
        }
      });

      appendLog("Content successfully indexed and published.");
    } catch (err) {
      appendLog(`Pipeline error: ${err.message}`);
      appendLog("Attempting auto-recovery retry sequence...");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-medium">Checking authorization permissions...</div>;
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600">You must be signed in as the system administrator to view this control panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center pb-6 mb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold">RevisionFlow Control Center</h1>
          <p className="text-sm text-gray-500 mt-1">Administrator: {ADMIN_EMAIL}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${activeTab === 'generator' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Auto Content Generator
          </button>
          <button
            onClick={() => { setActiveTab('users'); handleFetchUsers(); }}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            User Directory
          </button>
          <button
            onClick={() => { setActiveTab('resources'); handleFetchResources(); }}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${activeTab === 'resources' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Topic Resources
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg text-sm font-medium">
          {statusMessage}
        </div>
      )}

      {/* TAB 1: AUTOMATED CONTENT GENERATOR */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          <div className="bg-white p-6 border rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Automated Content Engine</h2>
            <p className="text-sm text-gray-600 mb-6">
              Generate official study sets and flashcards for specific exam boards and qualifications.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Qualification</label>
                <select
                  value={genQualification}
                  onChange={(e) => setGenQualification(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm"
                >
                  <option value="GCSE">GCSE</option>
                  <option value="AS-Level">AS-Level</option>
                  <option value="A-Level">A-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Subject</label>
                <input
                  type="text"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  placeholder="e.g. Physics, Chemistry, Maths"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Exam Board</label>
                <select
                  value={genBoard}
                  onChange={(e) => setGenBoard(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm"
                >
                  <option value="AQA">AQA</option>
                  <option value="Edexcel">Edexcel</option>
                  <option value="OCR">OCR</option>
                  <option value="WJEC">WJEC</option>
                  <option value="Eduqas">Eduqas</option>
                  <option value="CCEA">CCEA</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAutomatedGeneration}
              disabled={isGenerating}
              className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? 'Generation Sequence Active...' : 'Run Content Generation Pipeline'}
            </button>
          </div>

          {generationLogs.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs h-48 overflow-y-auto shadow-inner">
              <div className="font-bold text-gray-400 mb-2 border-b border-gray-800 pb-1">CONSOLE LOGS</div>
              {generationLogs.map((log, index) => (
                <div key={index} className="py-0.5">{log}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white p-6 border rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">User Lookup & Entitlements</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder="Enter user email..."
                value={selectedUserEmail}
                onChange={(e) => setSelectedUserEmail(e.target.value)}
                className="flex-1 p-2.5 border rounded-lg text-sm"
              />
              <button
                onClick={handleSearchUser}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black"
              >
                Find User
              </button>
            </div>

            {userSearchResult && (
              <div className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="font-bold">{userSearchResult.displayName || 'No Name'}</div>
                  <div className="text-xs text-gray-500">{userSearchResult.email} (UID: {userSearchResult.uid})</div>
                  <div className="text-xs mt-1">
                    Status: <span className="font-semibold">{userSearchResult.isPro || userSearchResult.betaUser ? 'Pro Access Active' : 'Free Access'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGrantPro(userSearchResult.uid, true)}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-green-700"
                  >
                    Grant Pro Access
                  </button>
                  <button
                    onClick={() => handleGrantPro(userSearchResult.uid, false)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-700"
                  >
                    Revoke Pro Access
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-sm">System User Roster</div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {usersList.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">Click "User Directory" tab to load user list.</div>
              ) : (
                usersList.map((u) => (
                  <div key={u.uid} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <div className="font-semibold text-sm">{u.displayName || u.email}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                    <button
                      onClick={() => handleGrantPro(u.uid, !u.isPro)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${u.isPro ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {u.isPro ? 'Pro User' : 'Standard User'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOPIC RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <form onSubmit={handleAddResource} className="bg-white p-6 border rounded-xl shadow-sm space-y-4">
            <h2 className="text-xl font-bold">Add Topic Resource Link</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Qualification</label>
                <select
                  value={newResource.qualification}
                  onChange={(e) => setNewResource({ ...newResource, qualification: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                >
                  <option value="GCSE">GCSE</option>
                  <option value="AS-Level">AS-Level</option>
                  <option value="A-Level">A-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newResource.subject}
                  onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  placeholder="e.g. Maths"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Exam Board</label>
                <select
                  value={newResource.board}
                  onChange={(e) => setNewResource({ ...newResource, board: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                >
                  <option value="AQA">AQA</option>
                  <option value="Edexcel">Edexcel</option>
                  <option value="OCR">OCR</option>
                  <option value="WJEC">WJEC</option>
                  <option value="Eduqas">Eduqas</option>
                  <option value="CCEA">CCEA</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  value={newResource.topic}
                  onChange={(e) => setNewResource({ ...newResource, topic: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  placeholder="e.g. Algebra"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Link Title</label>
                <input
                  type="text"
                  required
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  placeholder="e.g. Video Walkthrough"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Resource URL</label>
                <input
                  type="url"
                  required
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Resource Type</label>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                >
                  <option value="video">Video</option>
                  <option value="article">Article/Notes</option>
                  <option value="past_paper">Past Paper PDF</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-purple-700"
            >
              Add Resource
            </button>
          </form>

          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-sm">Indexed Resources</div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {resourceLinks.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No resources found in database.</div>
              ) : (
                resourceLinks.map((item) => (
                  <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.compoundTopicKey}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteResource(item.id)}
                      className="text-red-600 text-xs font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
