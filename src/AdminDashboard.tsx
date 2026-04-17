import React, { useState } from 'react';
import { X, Plus, Trash2, Save, LogOut, Loader2, Check } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';

export default function AdminDashboard({ data, setData, onClose }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState('bio');
  const [draftData, setDraftData] = useState(data);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
      alert("Gagal melakukan autentikasi dengan akun Google. Pastikan popup pada browser tidak diblokir.");
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'lucas' && password === 'lucas') {
      try {
        await signInAnonymously(auth);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Anonymous login disabled", err);
        alert("Server menolak akses. Anda belum mengaktifkan metode otentikasi 'Anonymous' di panel Firebase Console Anda. Harap gunakan Login Google atau minta Developer untuk mengaktifkan Anonymous Auth.");
      }
    } else {
      alert("Kredensial username atau password salah.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const docRef = doc(db, 'portfolio', 'data');
      await setDoc(docRef, {
        personalInfo: JSON.stringify(draftData.personalInfo),
        publications: JSON.stringify(draftData.publications),
        teachingMaterials: JSON.stringify(draftData.teachingMaterials),
        researchProjects: JSON.stringify(draftData.researchProjects),
        updatedAt: new Date().toISOString()
      });
      setData(draftData);
      try {
        localStorage.setItem('portfolioData', JSON.stringify(draftData));
      } catch (e) {}
      
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        window.location.reload(); // Refresh the whole page cleanly
      }, 1500); // Popup 'Tersimpan' tampil selama 1.5 detik
      
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan ke Database Firestore. Periksa koneksi internet Anda atau Rule Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-academic-ink/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-academic-muted hover:text-academic-ink transition-colors">
            <X size={24} />
          </button>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-academic-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-academic-muted/20">
              <span className="font-serif text-2xl font-bold text-academic-primary">L</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-academic-primary">Admin Access</h2>
            <p className="text-sm text-academic-muted mt-1">Gunakan akun Anda untuk masuk</p>
          </div>
          
          <form onSubmit={handleManualLogin} className="space-y-4 mb-5">
            <div>
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" required />
            </div>
            <div>
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" required />
            </div>
            <button type="submit" className="w-full bg-academic-primary text-white py-3 rounded-xl font-medium hover:bg-academic-accent transition-colors shadow-[0_4px_14px_0_rgba(0,118,255,0.2)]">
              Masuk Cepat
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute border-t border-academic-muted/20 w-full" />
            <span className="relative bg-white px-4 text-xs text-academic-muted tracking-widest uppercase">Atau</span>
          </div>

          <div className="space-y-5">
            <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-academic-muted/20 text-academic-ink py-3 rounded-xl font-medium hover:bg-academic-bg transition-colors shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            <p className="text-xs text-center text-academic-muted mt-4">Hanya Admin yang berwenang mengubah integrasi data Global via Cloud.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleBioChange = (field: string, value: string) => {
    setDraftData({ ...draftData, personalInfo: { ...draftData.personalInfo, [field]: value } });
  };

  const addPub = () => {
    const newPub = { id: Date.now(), title: '', authors: '', journal: '', year: new Date().getFullYear().toString(), link: '', type: 'Journal' };
    setDraftData({ ...draftData, publications: [newPub, ...draftData.publications] });
  };
  const updatePub = (index: number, field: string, value: string) => {
    const newPubs = [...draftData.publications];
    newPubs[index] = { ...newPubs[index], [field]: value };
    setDraftData({ ...draftData, publications: newPubs });
  };
  const removePub = (index: number) => {
    const newPubs = [...draftData.publications];
    newPubs.splice(index, 1);
    setDraftData({ ...draftData, publications: newPubs });
  };

  const addCourse = () => {
    const newCourse = { id: Date.now(), course: '', semester: '', driveFolderLink: '', materials: [] };
    setDraftData({ ...draftData, teachingMaterials: [newCourse, ...draftData.teachingMaterials] });
  };
  const updateCourse = (index: number, field: string, value: string) => {
    const newCourses = [...draftData.teachingMaterials];
    newCourses[index] = { ...newCourses[index], [field]: value };
    setDraftData({ ...draftData, teachingMaterials: newCourses });
  };
  const removeCourse = (index: number) => {
    const newCourses = [...draftData.teachingMaterials];
    newCourses.splice(index, 1);
    setDraftData({ ...draftData, teachingMaterials: newCourses });
  };
  
  const addMaterial = (courseIndex: number) => {
    const newCourses = [...draftData.teachingMaterials];
    newCourses[courseIndex].materials.push({ title: '', type: 'pdf', link: '' });
    setDraftData({ ...draftData, teachingMaterials: newCourses });
  };
  const updateMaterial = (courseIndex: number, matIndex: number, field: string, value: string) => {
    const newCourses = [...draftData.teachingMaterials];
    newCourses[courseIndex].materials[matIndex] = { ...newCourses[courseIndex].materials[matIndex], [field]: value };
    setDraftData({ ...draftData, teachingMaterials: newCourses });
  };
  const removeMaterial = (courseIndex: number, matIndex: number) => {
    const newCourses = [...draftData.teachingMaterials];
    newCourses[courseIndex].materials.splice(matIndex, 1);
    setDraftData({ ...draftData, teachingMaterials: newCourses });
  };

  const addResearch = () => {
    const newRes = { id: Date.now(), title: '', funding: '', year: '', role: '', description: '' };
    setDraftData({ ...draftData, researchProjects: [newRes, ...draftData.researchProjects] });
  };
  const updateResearch = (index: number, field: string, value: string) => {
    const newRes = [...draftData.researchProjects];
    newRes[index] = { ...newRes[index], [field]: value };
    setDraftData({ ...draftData, researchProjects: newRes });
  };
  const removeResearch = (index: number) => {
    const newRes = [...draftData.researchProjects];
    newRes.splice(index, 1);
    setDraftData({ ...draftData, researchProjects: newRes });
  };

  const tabs = [
    { id: 'bio', label: 'Biodata & Kontak' },
    { id: 'pub', label: 'Publikasi Jurnal' },
    { id: 'teach', label: 'Bahan Ajar' },
    { id: 'res', label: 'Penelitian' }
  ];

  return (
    <div className="fixed inset-0 bg-academic-bg z-[100] flex flex-col h-screen overflow-hidden text-academic-ink">
      <div className="bg-white border-b border-academic-muted/20 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-2xl font-bold text-academic-primary">Admin Control Panel</h1>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Terhubung ke Cloud Database</span>
        </div>
        <div className="flex gap-4">
          <button onClick={handleSave} disabled={isSaving || isSaved} className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition-all shadow-md ${isSaved ? 'bg-green-500 text-white' : 'bg-academic-accent text-white hover:opacity-90 disabled:opacity-50'}`}>
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : isSaved ? <Check size={18} /> : <Save size={18} />} 
            {isSaving ? 'Menyimpan...' : isSaved ? 'Tersimpan!' : 'Simpan ke Server'}
          </button>
          <button onClick={onClose} className="flex items-center gap-2 bg-academic-bg text-academic-ink border border-academic-muted/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-xl font-medium transition-all">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-64 bg-white border-r border-academic-muted/10 p-4 shrink-0 flex flex-col gap-2 z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-academic-muted mb-4 mt-2 px-4">Menu Editing</p>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-academic-primary text-white shadow-md' : 'text-academic-muted hover:bg-academic-bg hover:text-academic-ink'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-academic-bg">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-academic-muted/10 p-8 md:p-10">
            
            {activeTab === 'bio' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-academic-primary border-b border-academic-muted/10 pb-4 mb-8">Edit Biodata & Kontak Penuh</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.keys(draftData.personalInfo).map((key) => (
                    <div key={key} className={key === 'bio' ? 'col-span-1 md:col-span-2' : ''}>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-academic-muted mb-2">{key}</label>
                      {key === 'bio' ? (
                        <textarea 
                          rows={5} 
                          value={draftData.personalInfo[key]} 
                          onChange={(e) => handleBioChange(key, e.target.value)} 
                          className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm resize-none" 
                        />
                      ) : (
                        <input 
                          type="text" 
                          value={draftData.personalInfo[key]} 
                          onChange={(e) => handleBioChange(key, e.target.value)} 
                          className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pub' && (
              <div>
                <div className="flex justify-between items-center border-b border-academic-muted/10 pb-4 mb-8">
                  <h2 className="text-2xl font-serif font-bold text-academic-primary">Edit Jurnal / Publikasi</h2>
                  <button onClick={addPub} className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-100 hover:shadow-sm border border-green-200 transition-all">
                    <Plus size={16} /> Tambah Publikasi Baru
                  </button>
                </div>
                <div className="space-y-8">
                  {draftData.publications?.map((item: any, idx: number) => (
                    <div key={idx} className="p-6 md:p-8 border border-academic-muted/20 rounded-2xl relative bg-white shadow-sm hover:shadow-md transition-shadow">
                      <button onClick={() => removePub(idx)} className="absolute top-6 right-6 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      <h3 className="font-bold text-lg mb-6 pr-12 text-academic-ink">Publikasi #{idx + 1}: {item.title || '(Tanpa Judul)'}</h3>
                      <div className="grid md:grid-cols-2 gap-5 pr-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Judul Artikel / Jurnal</label>
                          <input type="text" value={item.title} onChange={e => updatePub(idx, 'title', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm font-serif font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">
                            Tautan / Link URL Publikasi
                          </label>
                          <input type="text" value={item.link} onChange={e => updatePub(idx, 'link', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" placeholder="https://" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Penulis (Authors)</label>
                          <input type="text" value={item.authors} onChange={e => updatePub(idx, 'authors', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Tahun Publikasi</label>
                          <input type="text" value={item.year} onChange={e => updatePub(idx, 'year', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Nama Jurnal / Prosiding</label>
                          <input type="text" value={item.journal} onChange={e => updatePub(idx, 'journal', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Tipe</label>
                          <select value={item.type} onChange={e => updatePub(idx, 'type', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm font-semibold text-academic-ink appearance-none">
                            <option value="Journal">Journal</option>
                            <option value="Conference">Conference</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'teach' && (
              <div>
                <div className="flex justify-between items-center border-b border-academic-muted/10 pb-4 mb-8">
                  <h2 className="text-2xl font-serif font-bold text-academic-primary">Edit Modul & Bahan Ajar</h2>
                  <button onClick={addCourse} className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-100 hover:shadow-sm border border-green-200 transition-all">
                    <Plus size={16} /> Tambah Mata Kuliah
                  </button>
                </div>
                <div className="space-y-10">
                  {draftData.teachingMaterials?.map((course: any, cIdx: number) => (
                    <div key={cIdx} className="p-6 md:p-8 border-2 border-academic-primary/10 rounded-[32px] relative bg-white shadow-sm hover:shadow-md transition-shadow">
                      <button onClick={() => removeCourse(cIdx)} className="absolute top-6 right-6 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 p-2 rounded-xl transition-colors"><Trash2 size={18} /></button>
                      <h3 className="font-bold text-xl mb-6 pr-12 text-academic-primary font-serif">Mata Kuliah: {course.course || '(Tanpa Nama)'}</h3>
                      
                      <div className="grid md:grid-cols-2 gap-5 mb-8 pr-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Nama Mata Kuliah</label>
                          <input type="text" value={course.course} onChange={e => updateCourse(cIdx, 'course', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Semester / Status / Info Kampus</label>
                          <input type="text" value={course.semester} onChange={e => updateCourse(cIdx, 'semester', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Link Drive Utama (Folder) - Opsional</label>
                          <input type="text" value={course.driveFolderLink} onChange={e => updateCourse(cIdx, 'driveFolderLink', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                      </div>

                      <div className="bg-academic-bg/50 p-6 rounded-2xl border border-academic-muted/10">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="font-bold text-sm uppercase tracking-widest text-academic-muted">Manajemen File Materi</h4>
                          <button onClick={() => addMaterial(cIdx)} className="flex items-center gap-2 bg-academic-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-academic-accent transition-colors shadow-sm">
                            <Plus size={14} /> Tambah Sub-File
                          </button>
                        </div>
                        <div className="space-y-3">
                          {course.materials?.length === 0 && <p className="text-sm text-academic-muted italic text-center py-4">Belum ada file materi ditambahkan untuk kampus/kursus ini.</p>}
                          {course.materials?.map((mat: any, mIdx: number) => (
                             <div key={mIdx} className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-xl border border-academic-muted/10">
                              <input type="text" placeholder="Judul File / Topik Materi" value={mat.title} onChange={e => updateMaterial(cIdx, mIdx, 'title', e.target.value)} className="w-full md:flex-1 px-3 py-2 bg-academic-bg rounded-lg text-sm border-transparent focus:border-academic-accent outline-none" />
                              <div className="flex w-full md:w-auto gap-2 items-center">
                                <select value={mat.type} onChange={e => updateMaterial(cIdx, mIdx, 'type', e.target.value)} className="w-20 px-3 py-2 border border-academic-muted/20 rounded-lg text-sm font-semibold bg-white outline-none">
                                  <option value="pdf">PDF</option>
                                  <option value="ppt">PPT</option>
                                  <option value="doc">DOC</option>
                                  <option value="zip">ZIP</option>
                                </select>
                                <input type="text" placeholder="URL Tautan Link" value={mat.link} onChange={e => updateMaterial(cIdx, mIdx, 'link', e.target.value)} className="w-40 md:w-56 px-3 py-2 bg-academic-bg border border-academic-muted/20 rounded-lg text-sm outline-none focus:border-academic-accent" />
                                <button onClick={() => removeMaterial(cIdx, mIdx)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg ml-1"><Trash2 size={18} /></button>
                              </div>
                             </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'res' && (
              <div>
                <div className="flex justify-between items-center border-b border-academic-muted/10 pb-4 mb-8">
                  <h2 className="text-2xl font-serif font-bold text-academic-primary">Edit Riset & Penelitian</h2>
                  <button onClick={addResearch} className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-100 hover:shadow-sm border border-green-200 transition-all">
                    <Plus size={16} /> Riset Baru
                  </button>
                </div>
                <div className="space-y-8">
                  {draftData.researchProjects?.map((res: any, idx: number) => (
                    <div key={idx} className="p-6 md:p-8 border border-academic-muted/20 rounded-2xl relative bg-white shadow-sm hover:shadow-md transition-shadow">
                      <button onClick={() => removeResearch(idx)} className="absolute top-6 right-6 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      <h3 className="font-bold text-lg mb-6 pr-12 text-academic-ink">Proyek Riset #{idx + 1}</h3>
                      <div className="grid md:grid-cols-2 gap-5 pr-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Judul Riset / Proyek</label>
                          <input type="text" value={res.title} onChange={e => updateResearch(idx, 'title', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm font-serif font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Sumber Pendanaan</label>
                          <input type="text" value={res.funding} onChange={e => updateResearch(idx, 'funding', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Tahun Pelaksanaan</label>
                          <input type="text" value={res.year} onChange={e => updateResearch(idx, 'year', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Peran (Role)</label>
                          <input type="text" value={res.role} onChange={e => updateResearch(idx, 'role', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Deskripsi Ringkas Singkat</label>
                          <textarea rows={4} value={res.description} onChange={e => updateResearch(idx, 'description', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm resize-none"></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
