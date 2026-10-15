import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Image as ImageIcon,
  Video,
  UserCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Sparkles,
  ShieldAlert,
  Eye,
  Lock,
  ArrowRight,
  Clock,
  Save,
  MapPin,
  Heart,
} from 'lucide-react';

export const MobileCreateView: React.FC = () => {
  const {
    currentUser,
    selectedCity,
    cities,
    categories,
    addListing,
    setMobileTab,
    saveDraft,
  } = useApp();

  // Step 1: Select Type: 'photo' | 'album' | 'video' | 'profile'
  const [contentType, setContentType] = useState<'photo' | 'album' | 'video' | 'profile'>('photo');

  // Media state
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    '/src/assets/images/discover_fashion_milan_1792084200282.jpg',
  ]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cityId, setCityId] = useState(selectedCity.id);
  const [district, setDistrict] = useState('Centro Storico');
  const [postalCode, setPostalCode] = useState('40121');
  const [age, setAge] = useState<number | ''>(24);
  const [gender, setGender] = useState<'donna' | 'uomo' | 'coppia' | 'trans'>('donna');
  const [targetGender, setTargetGender] = useState<'donna' | 'uomo' | 'tutti'>('uomo');
  const [intention, setIntention] = useState<'fidanzata' | 'fidanzato' | 'relazione' | 'amante' | 'incontri' | 'amicizia' | 'chiacchiere' | 'aperitivo' | 'massaggi'>('incontri');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'incontri');
  const [ratePerHour, setRatePerHour] = useState<number | ''>(120);
  const [visibility, setVisibility] = useState<'public' | 'followers_only'>('public');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Moda', 'Aperitivo']);

  // Upload & Moderation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'uploading' | 'moderation' | 'approved'>('idle');
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTags = [
    'Moda', 'Viaggi', 'Aperitivo', 'Fotografia', 'Cucina', 'Musica',
    'Fitness', 'Arte', 'Cinema', 'Design', 'Running', 'Serate'
  ];

  const presetImages = [
    '/src/assets/images/discover_fashion_milan_1792084200282.jpg',
    '/src/assets/images/verified_profile_preview_1792082231358.jpg',
    '/src/assets/images/discover_lounge_bologna_1792084200626.jpg',
    '/src/assets/images/discover_wellness_florence_1792084199196.jpg',
    '/src/assets/images/category_incontri_evening_1792082231469.jpg',
  ];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddSampleImage = (imgUrl: string) => {
    if (!uploadedImages.includes(imgUrl)) {
      setUploadedImages((prev) => [...prev, imgUrl]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  // Local File Upload with FileReader (JPG/PNG -> Base64 data URL)
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleSaveDraft = () => {
    if (!title.trim() && !description.trim()) return;
    saveDraft({
      title,
      description,
      cityId,
      district,
      postalCode,
      ratePerHour: ratePerHour ? Number(ratePerHour) : undefined,
      images: uploadedImages,
      tags: selectedTags,
    });
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || uploadedImages.length === 0) return;

    setIsSubmitting(true);
    setSubmissionStatus('uploading');
    setUploadProgress(20);

    // Realistic progress animation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          setSubmissionStatus('moderation');
          return 95;
        }
        return prev + 25;
      });
    }, 350);

    // Fast moderation pipeline compliant with AMICA safety
    setTimeout(() => {
      const targetCity = cities.find((c) => c.id === cityId) || selectedCity;

      addListing({
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40),
        categoryId,
        subcategoryId: intention === 'massaggi' ? 'Massaggi' : 'Personale',
        cityId,
        district,
        postalCode,
        address: `${district}, ${targetCity.name} (CAP ${postalCode})`,
        lat: targetCity.lat + (Math.random() - 0.5) * 0.02,
        lng: targetCity.lng + (Math.random() - 0.5) * 0.02,
        description: description.trim(),
        images: uploadedImages,
        ratePerHour: ratePerHour ? Number(ratePerHour) : undefined,
        verified: true,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        status: 'active',
        promotionTier: 'highlighted',
        likesCount: 1,
        tags: selectedTags,
        age: age ? Number(age) : 24,
        gender,
        targetGender,
        intention,
      });

      setSubmissionStatus('approved');
      setIsSubmitting(false);

      // Navigate to Home after confirmation
      setTimeout(() => {
        setMobileTab('home');
      }, 1500);
    }, 2400);
  };

  return (
    <div className="w-full min-h-[calc(100dvh-3.5rem)] bg-neutral-950 text-white pb-24 select-none">
      
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#CC09E6] flex items-center justify-center text-white shadow-md shadow-[#CC09E6]/30">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              Crea & Pubblica Annuncio
            </h1>
            <p className="text-[10px] text-neutral-400">AMICA Studio di Creazione Mobile</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 flex items-center gap-1 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Salva Bozza</span>
          </button>

          <button
            onClick={() => setMobileTab('home')}
            className="text-xs text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {draftSavedToast && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs py-1.5 px-4 text-center">
          Bozza salvata con successo sul tuo dispositivo!
        </div>
      )}

      <div className="max-w-md mx-auto p-4 space-y-5">
        
        {/* Step 1: Content Type Selector */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-2">
            1. Scegli tipo di pubblicazione
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setContentType('photo')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
                contentType === 'photo'
                  ? 'bg-[#CC09E6]/20 border-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/20'
                  : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <Camera className="w-5 h-5 mb-1 text-[#CC09E6]" />
              <span className="text-[10px] font-semibold">Foto</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('album')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
                contentType === 'album'
                  ? 'bg-[#CC09E6]/20 border-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/20'
                  : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-5 h-5 mb-1 text-[#00F2FE]" />
              <span className="text-[10px] font-semibold">Album</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('video')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
                contentType === 'video'
                  ? 'bg-[#CC09E6]/20 border-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/20'
                  : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <Video className="w-5 h-5 mb-1 text-purple-400" />
              <span className="text-[10px] font-semibold">Video</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('profile')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
                contentType === 'profile'
                  ? 'bg-[#CC09E6]/20 border-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/20'
                  : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-5 h-5 mb-1 text-emerald-400" />
              <span className="text-[10px] font-semibold">Incontri</span>
            </button>
          </div>
        </div>

        {/* Step 2: Media Selection & Previews */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-2">
            2. Foto & Album ({uploadedImages.length} caricate) *
          </label>

          {/* Hidden real file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLocalFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          {/* Upload Dropzone / Gallery Picker */}
          <div className="bg-neutral-900 border border-dashed border-white/20 rounded-2xl p-4 text-center">
            <Upload className="w-7 h-7 mx-auto text-[#CC09E6] mb-1.5" />
            <p className="text-xs font-semibold text-white">Carica le tue foto autentiche</p>
            <p className="text-[10px] text-neutral-400 mt-0.5 mb-3">JPG, PNG o WebP · Dal dispositivo</p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gradient-to-r from-[#CC09E6] to-[#9906AB] hover:from-[#B008C5] hover:to-[#830592] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scegli Foto dalla Galleria</span>
            </button>

            {/* Quick preset gallery loader */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <span className="text-[10px] text-neutral-400 block mb-1.5 font-medium">
                Oppure seleziona immagini verificate:
              </span>
              <div className="flex gap-2 justify-center overflow-x-auto no-scrollbar py-1">
                {presetImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSampleImage(img)}
                    className="w-11 h-11 rounded-lg overflow-hidden border border-white/20 hover:border-[#CC09E6] transition-all shrink-0 relative group"
                  >
                    <img src={img} alt="preset" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4 text-white" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Uploaded Thumbnails Preview */}
          {uploadedImages.length > 0 && (
            <div className="mt-2.5 flex gap-2 overflow-x-auto no-scrollbar py-1">
              {uploadedImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`w-18 h-22 rounded-xl overflow-hidden relative border shrink-0 group ${
                    idx === 0 ? 'border-[#CC09E6] shadow-md shadow-[#CC09E6]/30' : 'border-white/20'
                  }`}
                >
                  <img src={img} alt="uploaded" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-rose-500 transition-colors cursor-pointer"
                    title="Rimuovi foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 ? (
                    <span className="absolute bottom-1 left-1 bg-[#CC09E6] text-[8px] font-bold px-1.5 py-0.5 rounded text-white shadow">
                      Copertina
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCoverImage(idx)}
                      className="absolute bottom-1 left-1 bg-black/70 hover:bg-[#CC09E6] text-[8px] px-1.5 py-0.5 rounded text-white font-medium transition-colors"
                      title="Imposta come prima foto"
                    >
                      # {idx + 1}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Titolo dell'annuncio *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Sofia – Aperitivo e serate nel centro di Bologna..."
              className="w-full bg-neutral-900 text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6] transition-colors placeholder:text-neutral-500"
            />
          </div>

          {/* Dating Intention (Bakeca style direct dating purposes) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-300">
                Cosa cerchi? (交友目的) *
              </label>
              <span className="text-[10px] text-pink-400 font-medium">Bakeca Style Diretto</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'fidanzata', label: 'Cerco Ragazza (找女友)' },
                { id: 'fidanzato', label: 'Cerco Ragazzo (找男友)' },
                { id: 'relazione', label: 'Relazione Seria (找对象)' },
                { id: 'amante', label: 'Cerco Amante (找情人)' },
                { id: 'incontri', label: 'Incontri & Uscite (约会)' },
                { id: 'amicizia', label: 'Nuove Amicizie (找朋友)' },
                { id: 'chiacchiere', label: 'Chiacchiere (聊天)' },
                { id: 'aperitivo', label: 'Aperitivo & Drink' },
                { id: 'massaggi', label: 'Benessere & Spa' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIntention(opt.id as any)}
                  className={`py-2 px-1.5 text-[10px] font-semibold rounded-xl border text-center transition-all ${
                    intention === opt.id
                      ? 'bg-gradient-to-r from-[#CC09E6] to-[#9906AB] border-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/30'
                      : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Presentazione & Dettagli *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi chi sei, i tuoi interessi, disponibilità e cosa cerchi..."
              className="w-full bg-neutral-900 text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6] transition-colors placeholder:text-neutral-500 resize-none"
            />
          </div>

          {/* Age, Io Sono (My Gender) & Cerco (Target Gender) */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Mia Età
              </label>
              <input
                type="number"
                min={18}
                max={75}
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-neutral-900 text-xs text-white px-3 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Io sono
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-neutral-900 text-xs text-white px-2 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6]"
              >
                <option value="donna" className="bg-neutral-900 text-white">Donna</option>
                <option value="uomo" className="bg-neutral-900 text-white">Uomo</option>
                <option value="coppia" className="bg-neutral-900 text-white">Coppia</option>
                <option value="trans" className="bg-neutral-900 text-white">Trans</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Cerco chi
              </label>
              <select
                value={targetGender}
                onChange={(e) => setTargetGender(e.target.value as any)}
                className="w-full bg-neutral-900 text-xs text-white px-2 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6]"
              >
                <option value="uomo" className="bg-neutral-900 text-white">Uomini</option>
                <option value="donna" className="bg-neutral-900 text-white">Donne</option>
                <option value="tutti" className="bg-neutral-900 text-white">Tutti</option>
              </select>
            </div>
          </div>

          {/* City, CAP & District */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Città
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full bg-neutral-900 text-xs text-white px-2 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6]"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                CAP Italiano
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="40121"
                className="w-full bg-neutral-900 text-xs text-white px-3 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Zona
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Centro, Brera..."
                className="w-full bg-neutral-900 text-xs text-white px-3 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6]"
              />
            </div>
          </div>

          {/* Rate & Privacy */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Tariffa oraria (€ opzionale)
              </label>
              <input
                type="number"
                value={ratePerHour}
                onChange={(e) => setRatePerHour(e.target.value ? Number(e.target.value) : '')}
                placeholder="Es. 120"
                className="w-full bg-neutral-900 text-xs text-white px-3 py-2.5 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Visibilità
              </label>
              <div className="flex bg-neutral-900 border border-white/15 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    visibility === 'public'
                      ? 'bg-[#CC09E6] text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Tutti</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('followers_only')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    visibility === 'followers_only'
                      ? 'bg-[#CC09E6] text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Seguiti</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interest Tags Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Tag e Interessi ({selectedTags.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#CC09E6] border-[#CC09E6] text-white font-bold'
                        : 'bg-neutral-900 border-white/10 text-neutral-300 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/10 flex items-start gap-2.5 text-neutral-300">
            <ShieldAlert className="w-4 h-4 text-[#CC09E6] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Su AMICA sono vietati contenuti non consensuali, minori o materiale ingannevole. Ogni annuncio viene verificato prima dell'indicizzazione pubblica.
            </p>
          </div>

          {/* Progress / Status Display */}
          {submissionStatus !== 'idle' && (
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/15 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-white">
                  {submissionStatus === 'uploading' && <Upload className="w-4 h-4 text-[#00F2FE] animate-bounce" />}
                  {submissionStatus === 'moderation' && <Clock className="w-4 h-4 text-amber-400 animate-spin" />}
                  {submissionStatus === 'approved' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {submissionStatus === 'uploading' && `Caricamento file... ${uploadProgress}%`}
                  {submissionStatus === 'moderation' && 'Verifica conformità e moderazione AMICA...'}
                  {submissionStatus === 'approved' && 'Annuncio Approvato e Pubblicato su AMICA!'}
                </span>
                <span className="text-neutral-400 font-mono text-[10px]">{uploadProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00F2FE] via-[#CC09E6] to-emerald-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim() || uploadedImages.length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#CC09E6] to-[#A008B6] hover:brightness-110 disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-lg shadow-[#CC09E6]/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span>Elaborazione in corso...</span>
            ) : (
              <>
                <span>Invia per Moderazione e Pubblica</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>

    </div>
  );
};
