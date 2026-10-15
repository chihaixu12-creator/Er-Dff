import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Listing } from '../../types';
import {
  Users,
  Search,
  MapPin,
  ShieldCheck,
  Check,
  Plus,
  MessageCircle,
  Sparkles,
  UserCheck,
  ChevronRight,
  Filter,
  Heart,
  Navigation,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { calculateDistanceKm, geocodeItalianAddress } from '../../utils/geo';

export const MobileFriendsView: React.FC = () => {
  const {
    allUsers,
    currentUser,
    followingUserIds,
    toggleFollowUser,
    isFollowingUser,
    openUserProfileById,
    startConversation,
    setMobileTab,
    selectedCity,
    setSelectedCity,
    cities,
    datingMatches,
    swipeProfile,
    listings,
    userLocation,
    requestUserLocation,
    locationStatus,
  } = useApp();

  // Tabs: 'discover' | 'nearby' | 'matches' | 'following' | 'followers' | 'mutual'
  const [activeTab, setActiveTab] = useState<'discover' | 'nearby' | 'matches' | 'following' | 'followers' | 'mutual'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<number>(25);
  const [selectedIntention, setSelectedIntention] = useState<string>('Tutti');
  const [selectedTag, setSelectedTag] = useState<string>('Tutti');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const popularTags = ['Tutti', 'Aperitivo', 'Incontri', 'Moda', 'Viaggi', 'Design', 'Fotografia', 'Cucina', 'Musica', 'Running'];

  // Geocode address or CAP query if provided
  const geocodedReference = useMemo(() => {
    if (addressSearch.trim()) {
      return geocodeItalianAddress(addressSearch, selectedCity);
    }
    return null;
  }, [addressSearch, selectedCity]);

  // Reference coordinates for distance calculation
  const referenceCoords = useMemo(() => {
    if (geocodedReference) return { lat: geocodedReference.lat, lng: geocodedReference.lng };
    if (userLocation) return { lat: userLocation.lat, lng: userLocation.lng };
    return { lat: selectedCity.lat, lng: selectedCity.lng };
  }, [geocodedReference, userLocation, selectedCity]);

  // City coordinates map helper
  const cityCoordsMap: Record<string, { lat: number; lng: number }> = {
    'bologna': { lat: 44.4949, lng: 11.3426 },
    'milano': { lat: 45.4642, lng: 9.1900 },
    'roma': { lat: 41.9028, lng: 12.4964 },
    'firenze': { lat: 43.7696, lng: 11.2558 },
    'torino': { lat: 45.0703, lng: 7.6869 },
    'napoli': { lat: 40.8518, lng: 14.2681 },
    'venezia': { lat: 45.4408, lng: 12.3155 },
  };

  // Filter users based on activeTab, searchQuery, city, address distance, and tags
  const displayedUsers = useMemo(() => {
    // Exclude current logged in user from friends list
    let list = allUsers.filter((u) => u.id !== currentUser.id);

    // Apply Tab logic
    if (activeTab === 'following') {
      list = list.filter((u) => followingUserIds.includes(u.id));
    } else if (activeTab === 'followers') {
      list = list.filter((u) => u.id === 'user_marco_mi' || u.id === 'user_elena_fi' || u.id === 'user_chiara_rm');
    } else if (activeTab === 'mutual') {
      list = list.filter(
        (u) =>
          followingUserIds.includes(u.id) &&
          (u.id === 'user_marco_mi' || u.id === 'user_elena_fi')
      );
    } else if (activeTab === 'nearby') {
      list = list.filter((u) => !u.city || u.city.toLowerCase() === selectedCity.name.toLowerCase());
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.city && u.city.toLowerCase().includes(q)) ||
          (u.bio && u.bio.toLowerCase().includes(q)) ||
          (u.interests && u.interests.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    // Apply Tag filter
    if (selectedTag !== 'Tutti') {
      list = list.filter(
        (u) => u.interests && u.interests.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Attach calculated distance
    return list.map((user) => {
      const cityKey = (user.city || selectedCity.name).toLowerCase();
      const coords = cityCoordsMap[cityKey] || { lat: selectedCity.lat, lng: selectedCity.lng };
      const dist = calculateDistanceKm(referenceCoords.lat, referenceCoords.lng, coords.lat, coords.lng);
      return { ...user, distanceKm: dist };
    }).sort((a, b) => {
      if (activeTab === 'nearby' || addressSearch.trim()) {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      }
      return 0;
    });
  }, [allUsers, currentUser.id, activeTab, followingUserIds, selectedCity, searchQuery, selectedTag, referenceCoords, addressSearch]);

  const handleStartChat = (targetUser: User) => {
    startConversation(
      targetUser.id,
      targetUser.name,
      `Ciao ${targetUser.name}, ho visto il tuo profilo nella sezione Amici su AMICA!`
    );
    setMobileTab('inbox');
  };

  const handleLikeUserForMatch = (user: User) => {
    // Find or create synthetic listing for dating match algorithm
    const existingListing = listings.find((l) => l.authorId === user.id);
    const mockListing: Listing = existingListing || {
      id: `list_${user.id}`,
      title: user.name,
      slug: user.name.toLowerCase().replace(/\s+/g, '-'),
      categoryId: 'incontri',
      subcategoryId: 'Personale',
      cityId: selectedCity.id,
      district: user.city || selectedCity.name,
      lat: selectedCity.lat,
      lng: selectedCity.lng,
      description: user.bio || '',
      images: [user.avatar || '/src/assets/images/discover_fashion_milan_1792084200282.jpg'],
      verified: !!user.isVerified,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      status: 'active',
      promotionTier: 'none',
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
      viewsCount: 10,
      contactsCount: 1,
      tags: user.interests,
      age: user.age,
    };

    swipeProfile(mockListing, 'like');
  };

  return (
    <div className="w-full min-h-[calc(100dvh-3.5rem)] bg-neutral-950 text-white pb-20 select-none">
      
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-white/10 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#CC09E6]" />
            <h1 className="text-base font-bold tracking-tight text-white">
              Amici & Relazioni
            </h1>
          </div>

          {/* City quick selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-900 border border-white/15 px-2.5 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const found = cities.find((c) => c.id === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="bg-transparent text-white font-medium focus:outline-hidden cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar + Geo Filter toggle */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome, interessi o parole chiave..."
              className="w-full bg-neutral-900 text-xs text-white pl-9 pr-4 py-2 rounded-xl border border-white/15 focus:outline-hidden focus:border-[#CC09E6] transition-colors placeholder:text-neutral-500"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              isFilterOpen || addressSearch.trim()
                ? 'bg-[#CC09E6] text-white border-[#CC09E6]'
                : 'bg-neutral-900 text-neutral-400 border-white/15 hover:text-white'
            }`}
            title="Cerca per indirizzo / CAP e raggio"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsible Address / CAP & Distance Filter (P0 Requirement) */}
        {isFilterOpen && (
          <div className="mb-3 p-3 bg-neutral-900 border border-white/15 rounded-2xl space-y-2.5 text-xs animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>Ricerca per Indirizzo o CAP Italiano</span>
              </span>
              <button
                onClick={requestUserLocation}
                className="text-[11px] text-[#00F2FE] hover:underline font-semibold flex items-center gap-1"
              >
                <span>{locationStatus === 'granted' ? 'GPS Attivo ✓' : 'Usa mia Posizione'}</span>
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                placeholder="Es: 40121, Via Indipendenza, Brera, Navigli, Roma Termini..."
                className="w-full bg-neutral-950 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-white/15 focus:outline-hidden focus:border-[#CC09E6]"
              />
            </div>

            {geocodedReference && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zona rilevata: {geocodedReference.label}</span>
              </div>
            )}

            {/* Quick CAP tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] text-neutral-400">CAP veloci:</span>
              {['40121 Bologna', '20121 Milano', '00185 Roma', '50121 Firenze'].map((cap) => (
                <button
                  key={cap}
                  onClick={() => setAddressSearch(cap.split(' ')[0])}
                  className="text-[10px] bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded text-neutral-300 font-mono"
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs: Discover / Nearby / Matches / Following / Followers / Mutual */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeTab === 'discover'
                ? 'bg-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/30'
                : 'bg-neutral-900 text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            Consigliati
          </button>

          <button
            onClick={() => setActiveTab('nearby')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeTab === 'nearby'
                ? 'bg-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/30'
                : 'bg-neutral-900 text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            Vicini ({selectedCity.name})
          </button>

          {/* Dating Matches Tab */}
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1 ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-[#CC09E6] to-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'bg-neutral-900 text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Match ({datingMatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeTab === 'following'
                ? 'bg-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/30'
                : 'bg-neutral-900 text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            Seguiti ({followingUserIds.length})
          </button>

          <button
            onClick={() => setActiveTab('followers')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeTab === 'followers'
                ? 'bg-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/30'
                : 'bg-neutral-900 text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            Follower (3)
          </button>

          <button
            onClick={() => setActiveTab('mutual')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeTab === 'mutual'
                ? 'bg-[#CC09E6] text-white shadow-md shadow-[#CC09E6]/30'
                : 'bg-neutral-900 text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            Amici Comuni
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-[10px] font-medium px-2.5 py-0.5 rounded-md transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-white text-black font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Friends List */}
      <div className="p-4 space-y-3">
        {/* If Active Tab is Dating Matches */}
        {activeTab === 'matches' ? (
          datingMatches.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <Flame className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#CC09E6]" />
              <h3 className="text-sm font-bold text-white">Nessun Match ancora</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Metti Like alle persone nei canali Per Te o Consigliati. Quando l'interesse è reciproco, appariranno qui con la chat diretta!
              </p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 px-4 py-2 bg-[#CC09E6] text-white text-xs font-bold rounded-full shadow-md"
              >
                Esplora Profili Consigliati
              </button>
            </div>
          ) : (
            datingMatches.map((match) => (
              <div
                key={match.id}
                className="bg-neutral-900/90 border border-pink-500/30 rounded-2xl p-4 transition-all shadow-xl flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => openUserProfileById(match.partnerId, match.partnerName, match.partnerAvatar)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#CC09E6] to-[#00F2FE] shrink-0">
                    <img
                      src={match.partnerAvatar || '/src/assets/images/category_incontri_evening_1792082231469.jpg'}
                      alt={match.partnerName}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate">
                        {match.partnerName}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#CC09E6]" />
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold block">
                      ⚡ {match.compatibilityScore}% Affinità
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Match il {new Date(match.matchedAt).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    startConversation(
                      match.partnerId,
                      match.partnerName,
                      `Ciao ${match.partnerName}! Abbiamo un Match su AMICA!`
                    );
                    setMobileTab('inbox');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#CC09E6] to-pink-600 hover:from-[#B008C5] hover:to-pink-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#CC09E6]/30 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chatta</span>
                </button>
              </div>
            ))
          )
        ) : displayedUsers.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#CC09E6]" />
            <h3 className="text-sm font-bold text-white">Nessuna persona trovata</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              Nessun utente corrisponde a questa categoria o ai filtri di ricerca. Prova a selezionare un'altra città o azzerare l'indirizzo.
            </p>
          </div>
        ) : (
          displayedUsers.map((user) => {
            const isFollowing = isFollowingUser(user.id);

            return (
              <div
                key={user.id}
                className="bg-neutral-900/80 border border-white/10 rounded-2xl p-3.5 transition-all hover:border-[#CC09E6]/50 shadow-lg flex flex-col gap-3"
              >
                {/* Top User Info Row */}
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar & Identifiers */}
                  <div
                    onClick={() => openUserProfileById(user.id, user.name, user.avatar)}
                    className="flex items-center gap-3 cursor-pointer group flex-1"
                  >
                    <div className="w-13 h-13 rounded-full overflow-hidden bg-neutral-800 shrink-0 border-2 border-white/15 group-hover:border-[#CC09E6] transition-colors relative">
                      <img
                        src={user.avatar || '/src/assets/images/category_incontri_evening_1792082231469.jpg'}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white group-hover:text-[#CC09E6] transition-colors truncate">
                          {user.name}
                        </span>
                        {user.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-[#CC09E6] shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        {user.username && <span>@{user.username}</span>}
                        {user.age && <span>· {user.age} anni</span>}
                      </div>

                      {/* City & Calculated Real Distance */}
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#00F2FE]" />
                        <span>{user.city || selectedCity.name}</span>
                        {user.distanceKm != null && (
                          <span className="text-[#00F2FE] font-medium">
                            · a {user.distanceKm.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Like / Match & Follow */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleLikeUserForMatch(user)}
                      className="p-2 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all active:scale-95 border border-rose-500/30"
                      title="Metti Like / Match"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => toggleFollowUser(user.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shrink-0 ${
                        isFollowing
                          ? 'bg-neutral-800 text-neutral-300 border border-white/15 hover:bg-neutral-700'
                          : 'bg-[#CC09E6] text-white hover:bg-[#B008C5] shadow-[#CC09E6]/30'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Seguito</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Segui</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bio Snippet */}
                {user.bio && (
                  <p className="text-xs text-neutral-300 leading-relaxed text-left line-clamp-2 px-1">
                    {user.bio}
                  </p>
                )}

                {/* Interest Tags */}
                {user.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {user.interests.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md border border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Actions Row: Start Chat & View Profile */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openUserProfileById(user.id, user.name, user.avatar)}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors py-1 px-2"
                  >
                    <span>Vedi profilo completo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleStartChat(user)}
                    className="px-3 py-1 bg-neutral-800 hover:bg-[#CC09E6]/20 hover:text-[#CC09E6] text-neutral-200 text-xs font-semibold rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Invia Messaggio</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
