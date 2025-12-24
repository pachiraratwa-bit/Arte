
import React, { useState, useRef } from 'react';
import { LayoutManager } from './components/LayoutManager';
import { TemplateType, ClinicContent } from './types';
import { generateMarketingCaption, generateAIDesign } from './services/gemini';
import { toPng } from 'html-to-image';

const FONT_OPTIONS = [
  { name: 'Prompt (มาตรฐาน)', value: "'Prompt', sans-serif" },
  { name: 'Kanit (ทันสมัย)', value: "'Kanit', sans-serif" },
  { name: 'Noto Sans Thai (ทางการ)', value: "'Noto Sans Thai', sans-serif" },
  { name: 'Montserrat (สากล)', value: "'Montserrat', sans-serif" },
  { name: 'Playfair (หรูหราไฮเอนด์)', value: "'Playfair Display', serif" },
  { name: 'Bodoni (แฟชั่นนิตยสาร)', value: "'Bodoni Moda', serif" },
  { name: 'Libre Baskerville (พรีเมียม)', value: "'Libre Baskerville', serif" },
];

const LIVE_TEMPLATES: { id: TemplateType; name: string }[] = [
  { id: 'LIVE_MINIMAL', name: 'มุมจอมินิมอล' },
  { id: 'LIVE_BANNER', name: 'แบนเนอร์เต็มหน้า' },
  { id: 'LIVE_SIDEBAR', name: 'แถบข้างเน้นข้อมูล' },
  { id: 'LIVE_FULL_PROMO', name: 'โปรแรง ทะลุจอ' },
];

const App: React.FC = () => {
  const [template, setTemplate] = useState<TemplateType>('LIVE_BANNER');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [aiDescription, setAiDescription] = useState('');
  const [content, setContent] = useState<ClinicContent>({
    headline: 'LIVE นาทีทอง!',
    title: 'โปรแกรมเติมเต็มใบหน้า',
    subtitle: 'เฉพาะในไลฟ์นี้เท่านั้น',
    promotion: 'ฟรี! มาส์กหน้าทองคำ \nแถมฟรี! ฉีดหน้าใส 1 ครั้ง',
    mainImage: '',
    inset1: '',
    inset2: '',
    phone: '062-462-3635',
    lineId: '@artehouseclinic',
    registrationNo: 'ขสพ.สบ.4/2568',
    price: 'เริ่มต้น 9,900.-',
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingDesign, setLoadingDesign] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ClinicContent) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCaption = async () => {
    setLoadingAI(true);
    try {
      const text = await generateMarketingCaption(`${content.headline} ${content.title}`, content.promotion);
      alert(text);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAIDesignApply = async () => {
    if (!aiDescription.trim()) {
      alert("กรุณาระบุสินค้าหรือโปรโมชั่นเพื่อให้ AI ช่วยออกแบบ");
      return;
    }
    setLoadingDesign(true);
    try {
      const design = await generateAIDesign(aiDescription);
      if (design) {
        setContent(prev => ({
          ...prev,
          headline: design.headline,
          title: design.title,
          subtitle: design.subtitle,
          promotion: design.promotion,
          price: design.price
        }));
        setTemplate(design.template as TemplateType);
        
        const matchingFont = FONT_OPTIONS.find(f => f.name.includes(design.fontKeyword)) || FONT_OPTIONS[0];
        setSelectedFont(matchingFont.value);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDesign(false);
    }
  };

  const downloadImage = () => {
    if (previewRef.current === null) return;
    toPng(previewRef.current, { cacheBust: true, pixelRatio: 3 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `arte-live-frame-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Download failed', err);
      });
  };

  const FooterBar = () => (
    <div className="absolute bottom-4 inset-x-0 z-40 flex items-center justify-center pointer-events-none px-4">
       <div className="bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.25)] border border-white/50 flex flex-wrap items-center justify-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-2">
             <span className="text-[#f05a28] text-[10px] font-black uppercase tracking-widest">จอง/สอบถาม</span>
             <div className="flex items-center gap-1.5">
               <span className="text-sm">📞</span>
               <span className="text-[13px] font-black text-neutral-800 tracking-tight">{content.phone}</span>
             </div>
          </div>
          <div className="w-[1px] h-5 bg-neutral-200 hidden sm:block"></div>
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-[#06C755] rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-sm">LINE</div>
             <span className="text-[13px] font-black text-neutral-800 tracking-tight">{content.lineId}</span>
          </div>
          <div className="w-[1px] h-5 bg-neutral-200 hidden sm:block"></div>
          <div className="text-[11px] font-bold text-neutral-400">{content.registrationNo}</div>
       </div>
    </div>
  );

  const LiveBadge = () => (
    <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg text-white font-black text-base shadow-xl animate-pulse">
      <span className="w-3 h-3 bg-white rounded-full"></span>
      LIVE
    </div>
  );

  const placeholderImg = (id: string) => `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200&id=${id}`;

  return (
    <LayoutManager>
      {/* Sidebar for Live Config */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-neutral-200 p-6 overflow-y-auto max-h-[calc(100vh-72px)] shadow-inner">
        <div className="space-y-6">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </div>
            <h2 className="text-sm font-black text-red-700 uppercase tracking-widest">FB Live Studio</h2>
          </div>
          
          <section className="p-4 bg-gradient-to-br from-indigo-50 to-red-50 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
             <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
               <span className="text-lg">🤖</span> AI วางแผนการไลฟ์
             </h3>
             <textarea 
               value={aiDescription}
               onChange={(e) => setAiDescription(e.target.value)}
               placeholder="สินค้าคืออะไร? มีโปรฯ อะไรบ้าง?..."
               className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-200 min-h-[80px] resize-none"
             />
             <button 
               onClick={handleAIDesignApply}
               disabled={loadingDesign}
               className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md"
             >
               {loadingDesign ? 'กำลังวางแผน...' : 'ให้ AI ช่วยจัดรูปแบบไลฟ์'}
             </button>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1">เลือกสไตล์เฟรม</h3>
            <div className="grid grid-cols-2 gap-2">
              {LIVE_TEMPLATES.map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`py-3 px-3 rounded-xl text-[10px] font-bold transition-all border ${template === t.id ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1">ข้อความในไลฟ์</h3>
            
            <div className="space-y-3">
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">หัวข้อดึงดูด (Headline)</label>
                  <input type="text" name="headline" value={content.headline} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none font-bold" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">สินค้า/บริการ (Title)</label>
                  <input type="text" name="title" value={content.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-black outline-none" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">ราคา (Price)</label>
                  <input type="text" name="price" value={content.price} onChange={handleInputChange} className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-black text-red-600 outline-none" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">รายละเอียดอื่นๆ</label>
                  <textarea name="promotion" value={content.promotion} onChange={handleInputChange} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none h-20 resize-none" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase">ฟอนต์แสดงผล</label>
                  <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none">
                    {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                  </select>
               </div>
            </div>
          </section>

          <section className="space-y-3 pt-2 border-t border-neutral-100">
             <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">รูปประกอบ (เพื่อจัดวาง)</h3>
             <div className="space-y-2">
                <input type="file" onChange={(e) => handleImageUpload(e, 'mainImage')} className="hidden" id="main-up" accept="image/*" />
                <label htmlFor="main-up" className="block w-full py-2 bg-neutral-900 text-white rounded-lg text-[10px] font-bold text-center cursor-pointer hover:bg-black transition-all">📸 ใส่รูปฉากหลังไลฟ์ (Background)</label>
             </div>
          </section>

          <button onClick={handleGenerateCaption} disabled={loadingAI} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all shadow-xl active:scale-95">
            {loadingAI ? 'กำลังประมวลผล...' : '📢 สร้างแคปชั่นขายของสำหรับไลฟ์'}
          </button>
        </div>
      </aside>

      {/* Preview Section */}
      <section className="flex-1 bg-neutral-100 p-8 flex flex-col items-center justify-center overflow-auto min-h-[700px]">
        <div className="relative group">
          <div 
            ref={previewRef}
            className="bg-black shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden w-[600px] h-[600px] select-none rounded-sm"
            style={{ fontFamily: selectedFont }}
          >
            {/* Live Feed Background Simulation */}
            <div className="absolute inset-0 z-0">
               {content.mainImage ? (
                 <img src={content.mainImage} className="w-full h-full object-cover" alt="Live BG" />
               ) : (
                 <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-neutral-700">
                    <svg className="w-20 h-20 mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    <p className="text-xs font-bold uppercase tracking-widest">No Live Feed Selected</p>
                 </div>
               )}
               {/* Vignette Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
            </div>

            <LiveBadge />

            {/* Template: LIVE_BANNER (Full bottom banner with price) */}
            {template === 'LIVE_BANNER' && (
              <div className="absolute bottom-24 inset-x-0 z-30 px-6">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 shadow-[0_20px_50px_rgba(220,38,38,0.4)] border border-white/20 transform skew-x-[-2deg]">
                   <div className="transform skew-x-[2deg]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white text-[16px] font-black italic drop-shadow-md mb-1 uppercase tracking-tighter">{content.headline}</p>
                          <h2 className="text-white text-[32px] font-black drop-shadow-xl leading-none tracking-tight">{content.title}</h2>
                        </div>
                        <div className="bg-white px-5 py-2 rounded-2xl shadow-xl text-red-600">
                           <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">ราคาพิเศษ</p>
                           <p className="text-[24px] font-black leading-none">{content.price}</p>
                        </div>
                      </div>
                      <div className="h-[2px] bg-white/30 w-full mb-3"></div>
                      <div className="flex gap-4">
                         {content.promotion.split('\n').map((line, idx) => (
                           <div key={idx} className="flex items-center gap-2 text-white/95 text-[14px] font-bold">
                              <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></span>
                              {line}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Template: LIVE_MINIMAL (Clean, corner focus) */}
            {template === 'LIVE_MINIMAL' && (
               <div className="absolute bottom-32 left-8 z-30">
                  <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[2.5rem] shadow-2xl border-l-[10px] border-[#f05a28] max-w-[320px]">
                     <p className="text-[#f05a28] text-[14px] font-black italic mb-1 uppercase tracking-widest">{content.headline}</p>
                     <h2 className="text-neutral-900 text-[26px] font-black leading-tight mb-2">{content.title}</h2>
                     <div className="bg-[#f05a28] text-white px-4 py-1 rounded-full inline-block text-[18px] font-black mb-3">
                        {content.price}
                     </div>
                     <p className="text-neutral-500 text-[12px] font-bold leading-relaxed italic border-t border-neutral-100 pt-2">
                        {content.subtitle}
                     </p>
                  </div>
               </div>
            )}

            {/* Template: LIVE_SIDEBAR (Side info bar) */}
            {template === 'LIVE_SIDEBAR' && (
              <div className="absolute top-0 right-0 bottom-0 w-[200px] z-30 bg-black/30 backdrop-blur-md border-l border-white/20 p-6 flex flex-col justify-center gap-8">
                 <div className="text-right">
                    <p className="text-[#f05a28] text-[18px] font-black italic leading-none">{content.headline}</p>
                    <h2 className="text-white text-[34px] font-black leading-tight mt-2 drop-shadow-lg">{content.title}</h2>
                 </div>
                 <div className="bg-white p-4 rounded-3xl shadow-xl text-center transform -rotate-3">
                    <p className="text-neutral-400 text-[10px] font-black uppercase mb-1">🔥 HOT PRICE</p>
                    <p className="text-red-600 text-[24px] font-black">{content.price}</p>
                 </div>
                 <div className="space-y-4">
                    {content.promotion.split('\n').map((line, idx) => (
                      <div key={idx} className="text-white text-[13px] font-bold leading-tight border-r-4 border-yellow-400 pr-3 text-right">
                        {line}
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Template: LIVE_FULL_PROMO (Heavy promotional text) */}
            {template === 'LIVE_FULL_PROMO' && (
               <div className="absolute top-32 inset-x-0 z-30 text-center pointer-events-none">
                  <div className="bg-yellow-400 text-black px-8 py-2 text-2xl font-black italic inline-block mb-4 shadow-[0_15px_40px_rgba(250,204,21,0.5)] transform -rotate-2">
                     {content.headline}
                  </div>
                  <h2 className="text-[72px] font-black text-white italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-[0.8] tracking-tighter mb-4">
                     {content.title}
                  </h2>
                  <div className="bg-red-600 text-white text-[56px] font-black px-10 py-2 inline-block shadow-[0_10px_40px_rgba(220,38,38,0.6)] transform rotate-2">
                     {content.price}
                  </div>
                  <p className="text-white text-2xl font-bold italic drop-shadow-lg mt-6 bg-black/50 backdrop-blur-sm px-6 py-2 rounded-full inline-block">
                     {content.subtitle}
                  </p>
               </div>
            )}

            <FooterBar />
          </div>

          <button onClick={downloadImage} className="absolute -bottom-24 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-black text-white px-14 py-5 rounded-full font-black text-[15px] uppercase tracking-widest shadow-[0_20px_50px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4 group">
            <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export Live Frame (PNG)
          </button>
        </div>
      </section>
    </LayoutManager>
  );
};

export default App;
