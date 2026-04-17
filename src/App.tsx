import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, GraduationCap, FileText, Download, Mail, Phone, MapPin, ExternalLink, ChevronRight, Menu, X, Book, LayoutDashboard } from 'lucide-react';
import { personalInfo as initPersonal, publications as initPubs, teachingMaterials as initTeaching, researchProjects as initRes } from './lib/data';
import AdminDashboard from './AdminDashboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

function NavLink({ href, text, activeSection, onClick }: { href: string, text: string, activeSection: string, onClick?: () => void }) {
  const isActive = activeSection === href.replace('#', '');
  return (
    <a 
      href={href} 
      onClick={onClick}
      className={`text-sm tracking-widest uppercase transition-all duration-300 ${
        isActive ? 'text-academic-primary font-semibold' : 'text-academic-muted hover:text-academic-ink'
      }`}
    >
      {text}
      {isActive && (
        <motion.div 
          layoutId="navIndicator" 
          className="h-0.5 bg-academic-primary mt-1 rounded-full" 
        />
      )}
    </a>
  );
}

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [appData, setAppData] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolioData');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      personalInfo: initPersonal,
      publications: initPubs,
      teachingMaterials: initTeaching,
      researchProjects: initRes
    };
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'portfolio', 'data'), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        const updatedData = {
          personalInfo: d.personalInfo ? JSON.parse(d.personalInfo) : initPersonal,
          publications: d.publications ? JSON.parse(d.publications) : initPubs,
          teachingMaterials: d.teachingMaterials ? JSON.parse(d.teachingMaterials) : initTeaching,
          researchProjects: d.researchProjects ? JSON.parse(d.researchProjects) : initRes
        };
        setAppData(updatedData);
        localStorage.setItem('portfolioData', JSON.stringify(updatedData));
      }
    }, (error) => {
      console.error("Firebase read error:", error);
    });
    return () => unsub();
  }, []);

  const { personalInfo, publications, teachingMaterials, researchProjects } = appData;

  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) return;
    
    setFormStatus('submitting');
    // Simulate API request
    setTimeout(() => {
      setFormStatus('success');
      setFormName('');
      setFormEmail('');
      setFormMessage('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = ['home', 'research', 'publications', 'teaching', 'contact'];
      let current = '';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= (element.offsetTop - 200)) {
          current = section;
        }
      }
      
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-academic-bg text-academic-ink font-sans selection:bg-academic-accent selection:text-white pb-20 sm:pb-0">
      
      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-academic-bg/90 backdrop-blur-md border-b border-academic-muted/20 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 flex justify-between items-center w-full">
          <a href="#home" className="flex flex-col">
            <span className="font-serif font-bold text-xl text-academic-primary tracking-tight">DR. LUCAS M. PATTINAMA</span>
            <span className="text-xs uppercase tracking-widest text-academic-muted mt-0.5">Dosen & Peneliti</span>
          </a>
          
          <nav className="hidden md:flex gap-8 items-center">
            <NavLink href="#home" text="Beranda" activeSection={activeSection} />
            <NavLink href="#research" text="Penelitian" activeSection={activeSection} />
            <NavLink href="#publications" text="Publikasi" activeSection={activeSection} />
            <NavLink href="#teaching" text="Bahan Ajar" activeSection={activeSection} />
            <NavLink href="#contact" text="Kontak" activeSection={activeSection} />
          </nav>

          <button 
            className="md:hidden text-academic-ink" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-academic-bg/95 backdrop-blur-lg md:hidden flex flex-col pt-24 px-8"
          >
            <button 
              className="absolute top-6 right-6 text-academic-ink"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={28} />
            </button>
            <div className="flex flex-col gap-8 text-xl font-serif">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="border-b border-academic-muted/20 pb-4">Beranda</a>
              <a href="#research" onClick={() => setMobileMenuOpen(false)} className="border-b border-academic-muted/20 pb-4">Penelitian</a>
              <a href="#publications" onClick={() => setMobileMenuOpen(false)} className="border-b border-academic-muted/20 pb-4">Publikasi</a>
              <a href="#teaching" onClick={() => setMobileMenuOpen(false)} className="border-b border-academic-muted/20 pb-4">Bahan Ajar</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="border-b border-academic-muted/20 pb-4">Kontak</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-24 md:pt-28">
        {/* Home / Hero Section */}
        <section id="home" className="min-h-[calc(100vh-7rem)] flex items-center justify-center w-full px-6 md:px-12 lg:px-16 py-8 md:py-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-center w-full max-w-[1920px]">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1 flex flex-col justify-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-academic-primary/10 text-academic-primary rounded-full text-xs font-bold tracking-widest uppercase mb-5 self-start">
                <GraduationCap size={15} />
                <span>Akademisi</span>
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-[4rem] lg:text-[4.5rem] xl:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight mb-6 text-academic-primary">
                Komunikasi,<br />
                <span className="text-academic-accent italic font-bold">Pendidikan Kristen</span>,<br />
                <span className="text-academic-primary">&amp; Kepemimpinan.</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl font-medium text-academic-muted leading-relaxed mb-10 max-w-2xl">
                {personalInfo.bio}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="#publications" className="bg-academic-primary text-white px-10 py-5 rounded-2xl font-semibold text-base transition-transform hover:-translate-y-1 shadow-lg shadow-academic-primary/20 flex items-center gap-3">
                  Lihat Publikasi <ChevronRight size={20} />
                </a>
                <a href="#teaching" className="bg-white border-2 border-academic-primary/10 text-academic-primary px-10 py-5 rounded-2xl font-semibold text-base transition-colors hover:bg-academic-primary/5 flex items-center gap-3">
                  <Download size={20} /> Bahan Ajar
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 md:order-2 relative flex justify-center md:justify-end w-full"
            >
              <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[500px] xl:max-w-[580px] aspect-[4/5] rounded-[2.5rem] overflow-hidden relative shadow-[0_30px_60px_rgba(10,25,48,0.2)] bg-academic-bg border-[12px] border-white">
                {/* Gunakan layout height yang lebih besar (112%) daripada scale CSS, 
                    untuk mencegah gambar pecah (rasterization blur) oleh GPU di browser, 
                    sambil tetap meng-crop watermark di bagian bawah */}
                <img 
                  src="https://i.ibb.co.com/9kBVK2Hx/Gemini-Generated-Image-9mbi7a9mbi7a9mbi.png" 
                  alt={personalInfo.name} 
                  className="absolute top-0 left-0 w-full h-[112%] object-cover object-top transition-transform duration-700 hover:scale-[1.03]"
                  style={{ imageRendering: 'high-quality', WebkitFontSmoothing: 'antialiased' }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-academic-primary/40 via-transparent to-transparent pointer-events-none" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-8 sm:bottom-12 -left-4 sm:-left-12 md:-left-20 bg-white/95 backdrop-blur-md p-6 pb-5 rounded-3xl shadow-2xl border border-academic-primary/10 max-w-[240px] md:max-w-[280px]">
                <p className="font-serif font-extrabold text-academic-accent text-4xl md:text-4xl">STTIAA</p>
                <p className="text-sm font-bold uppercase tracking-wide text-academic-ink mt-2 text-balance leading-snug">Sekolah Tinggi Theologi<br/>Injili Abdi Allah</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 py-12 w-full">
          <div className="h-px bg-academic-muted/20 w-full" />
        </div>

        {/* Research Section */}
        <motion.section 
          id="research" 
          className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 py-20 w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <div className="mb-12 md:flex justify-between items-end">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-academic-primary mb-4 tracking-tight">Portofolio Penelitian</h2>
              <p className="text-academic-muted max-w-2xl">Menjelajahi inovasi baru dan pengembangan karakter dalam Pendidikan dan Kepemimpinan Kristen.</p>
            </div>
            <BookOpen className="text-academic-accent opacity-20 hidden md:block" size={80} strokeWidth={1} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {researchProjects?.map((project, index) => (
              <div key={project.id} className="group bg-white p-8 rounded-2xl border border-academic-muted/20 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-mono bg-academic-bg text-academic-primary px-3 py-1 rounded-full">
                    {project.year}
                  </span>
                  <span className="text-xs font-semibold tracking-wider uppercase text-academic-accent">
                    {project.role}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-academic-primary transition-colors leading-snug">
                  {project.title}
                </h3>
                <p className="text-sm font-medium text-academic-muted mb-4 pb-4 border-b border-academic-muted/10">Funding: {project.funding}</p>
                <p className="text-academic-ink/80 leading-relaxed text-sm">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Publications Section */}
        <motion.section 
          id="publications" 
          className="bg-white py-24 border-y border-academic-muted/10 mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <div className="max-w-[1920px] w-full mx-auto px-6 md:px-12 lg:px-16">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                <div>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold text-academic-primary mb-4 tracking-tight">Publikasi Akademik</h2>
                  <p className="text-academic-muted max-w-xl">Daftar publikasi terpilih pada jurnal dan konferensi internasional bereputasi.</p>
                </div>
                <a href={personalInfo.scholarId} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-academic-accent hover:text-academic-primary transition-colors border border-academic-accent/30 hover:border-academic-primary/30 px-5 py-2.5 rounded-full">
                  Google Scholar <ExternalLink size={14} />
                </a>
             </div>

             <div className="space-y-6">
               {publications?.map((item, i) => (
                 <div key={item.id} className="relative group pl-6 md:pl-10">
                   {/* Timeline Line */}
                   <div className="absolute left-0 top-3 bottom-0 w-px bg-academic-muted/20" />
                   {/* Timeline Dot */}
                   <div className="absolute left-[-4px] top-3 w-[9px] h-[9px] rounded-full bg-academic-accent ring-4 ring-white group-hover:scale-150 group-hover:bg-academic-primary transition-all duration-300" />
                   
                   <div className="bg-academic-bg/50 p-6 rounded-xl hover:bg-academic-primary/5 transition-colors duration-300">
                      <div className="flex flex-wrap gap-3 mb-2">
                        <span className="text-xs font-bold text-academic-muted uppercase tracking-widest">{item.year}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-academic-muted/20 text-academic-ink">{item.type}</span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-academic-primary transition-colors">
                        <a href={item.link}>{item.title}</a>
                      </h3>
                      <p className="text-academic-ink/80 text-sm mb-1">{item.authors}</p>
                      <p className="text-academic-muted text-sm italic">{item.journal}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </motion.section>

        {/* Teaching Materials (Bahan Ajar) */}
        <motion.section 
          id="teaching" 
          className="max-w-[1920px] w-full mx-auto px-6 md:px-12 lg:px-16 py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-academic-primary mb-4 tracking-tight">Bahan Ajar Mahasiswa</h2>
              <p className="text-academic-muted">Unduh materi perkuliahan, silabus, dan sumber belajar untuk mata kuliah yang diajarkan langsung via Google Drive saya.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {teachingMaterials?.map((course) => (
              <div key={course.id} className="flex flex-col bg-white border border-academic-muted/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="bg-academic-primary/5 p-6 border-b border-academic-muted/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Book className="text-academic-accent" size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider text-academic-muted">{course.semester}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-academic-primary leading-tight mb-4">{course.course}</h3>
                  {course.driveFolderLink && (
                    <a 
                      href={course.driveFolderLink} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold bg-academic-primary text-white px-4 py-2 rounded-full hover:bg-academic-ink transition-colors"
                    >
                      Buka Folder Drive <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <ul className="space-y-4 mb-6 flex-grow">
                    {course.materials?.map((mat, idx) => {
                      // Gunakan utilitas jika kita mau force direct download
                      // Tapi karena kita import, kita akan replace dengan custom action agar user bisa langsung klik dan unduh.
                      const isDriveLink = typeof mat.link === 'string' ? mat.link.includes('drive.google.com') : false;
                      // Simple regex for file ID mapping inside component
                      let directLink = mat.link || '#';
                      if (isDriveLink && typeof mat.link === 'string' && !mat.link.includes('uc?export=download')) {
                        const match = mat.link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                        if (match && match[1]) directLink = `https://drive.google.com/uc?export=download&id=${match[1]}`;
                      }

                      return (
                        <li key={idx} className="flex items-start justify-between group">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              mat.type === 'pdf' ? 'bg-red-50 text-red-600' :
                              mat.type === 'ppt' ? 'bg-orange-50 text-orange-600' :
                              mat.type === 'zip' ? 'bg-blue-50 text-blue-600' :
                              mat.type === 'doc' ? 'bg-blue-50 text-blue-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {mat.type}
                            </div>
                            <div>
                              <span className="text-sm font-medium block group-hover:text-academic-primary transition-colors">{mat.title}</span>
                            </div>
                          </div>
                          <a 
                            href={directLink} 
                            target={isDriveLink ? "_self" : "_blank"}
                            rel={isDriveLink ? "" : "noopener noreferrer"}
                            className="p-2 text-academic-accent bg-academic-accent/5 hover:bg-academic-accent hover:text-white rounded-full transition-all shrink-0"
                            aria-label={`Download ${mat.title}`}
                            title="Unduh Langsung"
                          >
                            <Download size={16} />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                  
                  <div className="mt-auto border-t border-academic-muted/10 pt-4">
                    <p className="text-[10px] text-academic-muted italic text-center w-full">
                      Tautan unduhan diintegrasikan langsung ke Google Drive Dosen.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section 
          id="contact" 
          className="bg-academic-primary text-white py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Mari Berkolaborasi.</h2>
              <p className="text-white/70 mb-10 text-lg leading-relaxed max-w-md">
                Terbuka untuk diskusi penelitian, pembimbingan akademik, maupun peluang kerja sama riset industri.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-full shrink-0">
                    <Mail className="text-academic-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Email</p>
                    <a href={`mailto:${personalInfo.email}`} className="text-lg hover:text-academic-accent transition-colors">
                      {personalInfo.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-full shrink-0">
                    <Phone className="text-academic-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Telepon / WhatsApp</p>
                    <a href={`tel:${personalInfo.phone}`} className="text-lg hover:text-academic-accent transition-colors">
                      {personalInfo.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-full shrink-0">
                    <MapPin className="text-academic-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Ruang Kerja / Kantor</p>
                    <p className="text-lg">
                      {personalInfo.office}<br />
                      <span className="text-white/70 text-base">{personalInfo.university}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-academic-muted/10 rounded-2xl p-8 text-academic-ink shadow-sm relative overflow-hidden">
              <h3 className="font-serif text-2xl font-bold mb-6 text-academic-primary">Tinggalkan Pesan</h3>
              {formStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Pesan Terkirim</h4>
                  <p className="text-sm">Terima kasih telah menghubungi. Pesan Anda telah diterima dan akan segera direspons.</p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleFormSubmit}>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-academic-muted mb-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      className="w-full bg-academic-bg border border-academic-muted/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-academic-accent focus:border-academic-accent transition-all" 
                      placeholder="Masukkan nama" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-academic-muted mb-2">Alamat Email</label>
                    <input 
                      type="email" 
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                      className="w-full bg-academic-bg border border-academic-muted/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-academic-accent focus:border-academic-accent transition-all" 
                      placeholder="Masukkan alamat email" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-academic-muted mb-2">Pesan</label>
                    <textarea 
                      rows={4} 
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      required
                      className="w-full bg-academic-bg border border-academic-muted/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-academic-accent focus:border-academic-accent transition-all resize-none" 
                      placeholder="Tuliskan tujuan atau pertanyaan Anda..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="w-full bg-academic-primary text-white font-medium py-3.5 rounded-xl hover:bg-academic-accent transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formStatus === 'submitting' ? 'Mengirim...' : 'Kirim Pesan'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="bg-academic-ink text-white py-8 border-t border-white/10 w-full">
        <div className="max-w-[1920px] w-full mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} {personalInfo.name}. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <a href={personalInfo.scholarId} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors text-sm font-medium">Google Scholar</a>
            <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors text-sm font-medium">LinkedIn</a>
            <span className="text-white/20">|</span>
            <button onClick={() => setShowAdmin(true)} className="text-white/50 hover:text-white transition-colors text-sm font-medium cursor-pointer">Admin</button>
          </div>
        </div>
      </footer>
      
      {showAdmin && (
        <AdminDashboard data={appData} setData={setAppData} onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
}

