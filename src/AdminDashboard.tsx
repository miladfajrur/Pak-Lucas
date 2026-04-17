import React, { useState } from 'react';
import { X, Plus, Trash2, Save, LogOut, UploadCloud, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

export default function AdminDashboard({ data, setData, onClose }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingState, setUploadingState] = useState<{ [key: string]: number }>({});
  
  const [activeTab, setActiveTab] = useState('bio');
  const [draftData, setDraftData] = useState(data);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'lucas' && password === 'lucas') {
      try {
        await signInAnonymously(auth);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Login failed", error);
        alert("Gagal melakukan autentikasi dengan server Firebase.");
      }
    } else {
      alert('Username atau password salah!');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
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
      localStorage.setItem('portfolioData', JSON.stringify(draftData));
      alert('Perubahan berhasil disimpan secara Global! Pengunjung kini akan melihat data terbaru.');
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan ke Database Firestore. Periksa koneksi internet Anda atau Rule Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string, size: string) => void, uploadId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hitung ukuran MB
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // Buat referensi storage ke Firebase
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadingState(prev => ({ ...prev, [uploadId]: 0 }));

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadingState(prev => ({ ...prev, [uploadId]: progress }));
      }, 
      (error) => {
        console.error(error);
        alert("Gagal mengupload file ke Storage.");
        setUploadingState(prev => {
          const newState = { ...prev };
          delete newState[uploadId];
          return newState;
        });
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          callback(downloadURL, sizeInMB);
          setUploadingState(prev => {
            const newState = { ...prev };
            delete newState[uploadId];
            return newState;
          });
        });
      }
    );
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
            <p className="text-sm text-academic-muted mt-1">Gunakan kredensial Anda untuk masuk</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-academic-muted mb-2">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent focus:border-academic-accent outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-academic-muted mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent focus:border-academic-accent outline-none text-sm" required />
            </div>
            <button type="submit" className="w-full bg-academic-primary text-white py-3.5 mt-2 rounded-xl font-medium hover:bg-academic-accent transition-colors shadow-lg">
              Masuk Server Cloud
            </button>
          </form>
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
    newCourses[courseIndex].materials.push({ title: '', type: 'pdf', size: '', link: '' });
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
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-academic-accent text-white px-5 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-50">
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan ke Server
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
                  {draftData.publications.map((item: any, idx: number) => {
                    const upId = `pub_${idx}`;
                    return (
                    <div key={idx} className="p-6 md:p-8 border border-academic-muted/20 rounded-2xl relative bg-white shadow-sm hover:shadow-md transition-shadow">
                      <button onClick={() => removePub(idx)} className="absolute top-6 right-6 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      <h3 className="font-bold text-lg mb-6 pr-12 text-academic-ink">Publikasi #{idx + 1}: {item.title || '(Tanpa Judul)'}</h3>
                      <div className="grid md:grid-cols-2 gap-5 pr-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">Judul Artikel / Jurnal</label>
                          <input type="text" value={item.title} onChange={e => updatePub(idx, 'title', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm font-serif font-medium" />
                        </div>
                        <div>
                          <label className="block flex items-center justify-between text-xs font-bold uppercase tracking-widest text-academic-muted mb-2">
                            <span>Link URL (Atau Upload PDF)</span>
                            {uploadingState[upId] !== undefined && (
                              <span className="text-academic-accent">Uploading {Math.round(uploadingState[upId])}%</span>
                            )}
                          </label>
                          <div className="flex relative">
                             <input type="text" value={item.link} onChange={e => updatePub(idx, 'link', e.target.value)} className="w-full px-4 py-3 bg-academic-bg border border-academic-muted/20 rounded-l-xl focus:ring-2 focus:ring-academic-accent outline-none text-sm" placeholder="https://" />
                             <label title="Upload PDF ke Cloud" className="bg-academic-accent border border-academic-accent text-white px-4 py-3 rounded-r-xl cursor-pointer hover:bg-academic-primary transition-colors flex items-center justify-center shrink-0">
                               {uploadingState[upId] !== undefined ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                               <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, (url) => updatePub(idx, 'link', url), upId)} />
                             </label>
                          </div>
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
                  )})}
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
                  {draftData.teachingMaterials.map((course: any, cIdx: number) => (
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
                          {course.materials.length === 0 && <p className="text-sm text-academic-muted italic text-center py-4">Belum ada file materi ditambahkan untuk kampus/kursus ini.</p>}
                          {course.materials.map((mat: any, mIdx: number) => {
                            const upId = `mat_${cIdx}_${mIdx}`;
                            return (
                             <div key={mIdx} className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-xl border border-academic-muted/10">
                              <input type="text" placeholder="Judul File / Topik Materi" value={mat.title} onChange={e => updateMaterial(cIdx, mIdx, 'title', e.target.value)} className="w-full md:flex-1 px-3 py-2 bg-academic-bg rounded-lg text-sm border-transparent focus:border-academic-accent outline-none" />
                              <div className="flex w-full md:w-auto gap-2 items-center">
                                <select value={mat.type} onChange={e => updateMaterial(cIdx, mIdx, 'type', e.target.value)} className="w-20 px-3 py-2 border border-academic-muted/20 rounded-lg text-sm font-semibold bg-white outline-none">
                                  <option value="pdf">PDF</option>
                                  <option value="ppt">PPT</option>
                                  <option value="doc">DOC</option>
                                  <option value="zip">ZIP</option>
                                </select>
                                <input type="text" placeholder="Size" value={mat.size} onChange={e => updateMaterial(cIdx, mIdx, 'size', e.target.value)} className="w-20 px-3 py-2 bg-academic-bg border border-academic-muted/20 rounded-lg text-sm outline-none" />
                                <div className="flex relative">
                                  <input type="text" placeholder="URL Link" value={mat.link} onChange={e => updateMaterial(cIdx, mIdx, 'link', e.target.value)} className="w-32 md:w-40 px-3 py-2 bg-academic-bg border border-academic-muted/20 rounded-l-lg text-sm outline-none" />
                                  <label title="Upload File ke Cloud Storage" className="bg-academic-accent text-white px-3 py-2 rounded-r-lg cursor-pointer hover:bg-academic-primary transition-colors flex items-center justify-center shrink-0">
                                    {uploadingState[upId] !== undefined ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" onChange={(e) => handleFileUpload(e, (url, sz) => { updateMaterial(cIdx, mIdx, 'link', url); updateMaterial(cIdx, mIdx, 'size', sz); }, upId)} />
                                  </label>
                                </div>
                                <button onClick={() => removeMaterial(cIdx, mIdx)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg ml-1"><Trash2 size={18} /></button>
                              </div>
                             </div>
                            );
                          })}
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
                  {draftData.researchProjects.map((res: any, idx: number) => (
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
