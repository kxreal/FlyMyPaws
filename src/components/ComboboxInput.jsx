import React, { useState, useRef, useEffect } from 'react';

// ── Data ────────────────────────────────────────────
export const AIRPORTS = [
  // Asia
  'Hong Kong (HKG)', 'Singapore (SIN)', 'Tokyo Haneda (HND)', 'Tokyo Narita (NRT)',
  'Osaka Kansai (KIX)', 'Seoul Incheon (ICN)', 'Taipei Taoyuan (TPE)',
  'Bangkok Suvarnabhumi (BKK)', 'Bangkok Don Mueang (DMK)', 'Kuala Lumpur (KUL)',
  'Jakarta (CGK)', 'Manila (MNL)', 'Ho Chi Minh City (SGN)', 'Hanoi (HAN)',
  'Beijing Capital (PEK)', 'Beijing Daxing (PKX)', 'Shanghai Pudong (PVG)',
  'Shanghai Hongqiao (SHA)', 'Guangzhou (CAN)', 'Shenzhen (SZX)', 'Chengdu (CTU)',
  'Chongqing (CKG)', 'Kunming (KMG)', 'Xi\'an (XIY)', 'Hangzhou (HGH)',
  'Nanjing (NKG)', 'Wuhan (WUH)', 'Mumbai (BOM)', 'Delhi (DEL)',
  'Chennai (MAA)', 'Bangalore (BLR)', 'Colombo (CMB)', 'Kathmandu (KTM)',
  'Dhaka (DAC)', 'Islamabad (ISB)', 'Karachi (KHI)', 'Lahore (LHE)',
  // Middle East
  'Dubai (DXB)', 'Abu Dhabi (AUH)', 'Doha (DOH)', 'Riyadh (RUH)',
  'Jeddah (JED)', 'Kuwait (KWI)', 'Bahrain (BAH)', 'Muscat (MCT)',
  // Europe
  'London Heathrow (LHR)', 'London Gatwick (LGW)', 'London Stansted (STN)',
  'Paris CDG (CDG)', 'Paris Orly (ORY)', 'Amsterdam (AMS)', 'Frankfurt (FRA)',
  'Munich (MUC)', 'Zurich (ZRH)', 'Geneva (GVA)', 'Vienna (VIE)',
  'Brussels (BRU)', 'Copenhagen (CPH)', 'Stockholm (ARN)', 'Oslo (OSL)',
  'Helsinki (HEL)', 'Madrid (MAD)', 'Barcelona (BCN)', 'Lisbon (LIS)',
  'Rome Fiumicino (FCO)', 'Milan Malpensa (MXP)', 'Athens (ATH)',
  'Warsaw (WAW)', 'Prague (PRG)', 'Budapest (BUD)', 'Dublin (DUB)',
  'Edinburgh (EDI)', 'Manchester (MAN)',
  // Africa
  'Cairo (CAI)', 'Johannesburg (JNB)', 'Cape Town (CPT)', 'Nairobi (NBO)',
  'Addis Ababa (ADD)', 'Lagos (LOS)', 'Casablanca (CMN)',
  // Oceania
  'Sydney (SYD)', 'Melbourne (MEL)', 'Brisbane (BNE)', 'Perth (PER)',
  'Auckland (AKL)', 'Christchurch (CHC)',
  // North America
  'New York JFK (JFK)', 'New York Newark (EWR)', 'Los Angeles (LAX)',
  'San Francisco (SFO)', 'Chicago O\'Hare (ORD)', 'Chicago Midway (MDW)',
  'Dallas/Fort Worth (DFW)', 'Houston (IAH)', 'Atlanta (ATL)',
  'Miami (MIA)', 'Seattle (SEA)', 'Denver (DEN)', 'Boston (BOS)',
  'Washington Dulles (IAD)', 'Washington Reagan (DCA)',
  'Las Vegas (LAS)', 'Phoenix (PHX)', 'Minneapolis (MSP)',
  'Toronto Pearson (YYZ)', 'Vancouver (YVR)', 'Montreal (YUL)',
  'Mexico City (MEX)', 'Cancun (CUN)',
  // South America
  'São Paulo (GRU)', 'Rio de Janeiro (GIG)', 'Buenos Aires (EZE)',
  'Bogotá (BOG)', 'Lima (LIM)', 'Santiago (SCL)',
];

export const AIRLINES = [
  // Asia-Pacific
  'Cathay Pacific (CX)', 'Hong Kong Express (UO)', 'Air Hong Kong (LD)',
  'Singapore Airlines (SQ)', 'Scoot (TR)', 'SilkAir (MI)',
  'Japan Airlines (JL / JAL)', 'ANA All Nippon Airways (NH)', 'Peach Aviation (MM)', 'Jetstar Japan (GK)',
  'Korean Air (KE)', 'Asiana Airlines (OZ)', 'Jin Air (LJ)', 'Jeju Air (7C)',
  'EVA Air (BR)', 'China Airlines (CI)', 'Starlux Airlines (JX)', 'Tigerair Taiwan (IT)',
  'Thai Airways (TG)', 'Bangkok Airways (PG)', 'Thai AirAsia (FD)', 'Thai Lion Air (SL)',
  'Malaysia Airlines (MH)', 'AirAsia (AK)', 'Batik Air Malaysia (OD)',
  'Garuda Indonesia (GA)', 'Lion Air (JT)', 'Batik Air (ID)', 'Citilink (QG)',
  'Philippine Airlines (PR)', 'Cebu Pacific (5J)',
  'Vietnam Airlines (VN)', 'VietJet Air (VJ)', 'Bamboo Airways (QH)',
  'Air China (CA)', 'China Eastern (MU)', 'China Southern (CZ)', 'Hainan Airlines (HU)',
  'Xiamen Airlines (MF)', 'Shenzhen Airlines (ZH)', 'Sichuan Airlines (3U)',
  'Air India (AI)', 'IndiGo (6E)', 'SpiceJet (SG)', 'Vistara (UK)',
  'SriLankan Airlines (UL)', 'Himalaya Airlines (H9)',
  // Middle East
  'Emirates (EK)', 'Etihad Airways (EY)', 'FlyDubai (FZ)',
  'Qatar Airways (QR)', 'Saudi Arabian Airlines / Saudia (SV)', 'flynas (XY)',
  'Kuwait Airways (KU)', 'Oman Air (WY)', 'Gulf Air (GF)',
  // Europe
  'British Airways (BA)', 'easyJet (U2)', 'Ryanair (FR)', 'Virgin Atlantic (VS)',
  'Lufthansa (LH)', 'Eurowings (EW)', 'Condor (DE)',
  'Air France (AF)', 'Transavia France (TO)',
  'KLM Royal Dutch Airlines (KL)', 'Transavia Netherlands (HV)',
  'Swiss International Air Lines (LX)', 'Edelweiss Air (WK)',
  'Austrian Airlines (OS)', 'Brussels Airlines (SN)',
  'Scandinavian Airlines (SK / SAS)', 'Norwegian Air (DY)', 'Finnair (AY)',
  'Iberia (IB)', 'Vueling (VY)', 'Volotea (V7)',
  'TAP Air Portugal (TP)',
  'ITA Airways (AZ)', 'Neos (NO)',
  'Aegean Airlines (A3)',
  'LOT Polish Airlines (LO)', 'Czech Airlines (OK)',
  'Aeroflot (SU)',
  // Africa
  'EgyptAir (MS)', 'South African Airways (SA)', 'Ethiopian Airlines (ET)',
  'Kenya Airways (KQ)', 'Royal Air Maroc (AT)',
  // Oceania
  'Qantas (QF)', 'Jetstar (JQ)', 'Virgin Australia (VA)', 'Rex Regional Express (ZL)',
  'Air New Zealand (NZ)',
  // North America
  'American Airlines (AA)', 'Delta Air Lines (DL)', 'United Airlines (UA)',
  'Southwest Airlines (WN)', 'Alaska Airlines (AS)', 'JetBlue (B6)',
  'Spirit Airlines (NK)', 'Frontier Airlines (F9)', 'Hawaiian Airlines (HA)',
  'Air Canada (AC)', 'WestJet (WS)', 'Flair Airlines (F8)',
  'Volaris (Y4)', 'Aeromexico (AM)',
  // South America
  'LATAM Airlines (LA)', 'Avianca (AV)', 'Copa Airlines (CM)', 'GOL (G3)',
  // Cargo / other
  'FedEx Express (FX)', 'UPS Airlines (5X)', 'DHL Air (D0)',
];

// ── Component ─────────────────────────────────────
const ComboboxInput = ({
  value, onChange, placeholder, suggestions, id, required,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const ref = useRef(null);

  // Sync external value changes
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.length < 1
    ? suggestions.slice(0, 8)
    : suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 10);

  const select = (val) => {
    setQuery(val);
    onChange(val);
    setOpen(false);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);   // allow free text
    setOpen(true);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        id={id}
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="form-control"
        style={{ width: '100%' }}
      />
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', zIndex: 1000, top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
          borderRadius: '10px', maxHeight: '220px', overflowY: 'auto',
          listStyle: 'none', margin: 0, padding: '0.35rem 0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {filtered.map(s => (
            <li
              key={s}
              onMouseDown={() => select(s)}
              style={{
                padding: '0.5rem 0.85rem', fontSize: '0.85rem',
                cursor: 'pointer', color: 'var(--color-text-main)',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--color-primary-bg)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {s}
            </li>
          ))}
          {/* Free-text hint */}
          {!filtered.some(s => s.toLowerCase() === query.toLowerCase()) && query.length > 0 && (
            <li
              onMouseDown={() => select(query)}
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', color: 'var(--color-primary)', cursor: 'pointer', borderTop: '1px solid var(--color-border)', fontWeight: 500 }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--color-primary-bg)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              ✏️ Use "{query}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ComboboxInput;
