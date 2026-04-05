import React from 'react';

const HowItWorks = () => {
  return (
    <div style={{ padding: '3rem 0', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* ── Meaning of Travel ── */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>The Meaning of Travel</h2>
          <div style={{ color: 'var(--color-text)', lineHeight: 1.8, fontSize: '1.05rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>What does travel mean to you?</p>
            <p style={{ marginBottom: '1.5rem' }}>Is it about the thrill of exploring uncharted corners of the world? Creating unforgettable memories that stay with you forever? Or perhaps a fleeting escape from the relentless pace of everyday life?</p>
            <p style={{ marginBottom: '1.5rem' }}>But have you ever imagined that your journey could mean something more? What if travel could mean something more — something that echoes far beyond your journey home?</p>
            <p style={{ marginBottom: '1.5rem' }}>Imagine this: without spending a single dollar, without changing your plans, a simple act during your trip could rewrite the destiny of a living soul. A pair of eyes that once knew only fear and uncertainty, finally finding their way home — because of you.</p>
            <p style={{ marginBottom: '1.5rem' }}>Flymypaws is a pet-and-volunteer matching platform dedicated to connecting rescued pets and relocation families with compassionate flight volunteers. By making it easier and more affordable for animals to cross borders, we open the door to international adoptions, give displaced pets a fighting chance at a forever home, and take one step closer to a world where no animal is left behind.</p>
            <p style={{ marginBottom: '1.5rem', fontWeight: 600 }}>You really don't have to do anything special, don’t need to donate. No financial cost for the volunteers. The pet owners and the rescues will arrange everything.</p>
            <p style={{ marginBottom: '1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>You just have to fly and allow the pets to be added to your ticket.</p>
          </div>
        </section>


        {/* ── How It Works ── */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>How It Works</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>In fact, this is far from a new idea — for years, kind-hearted travellers around the world have been doing this, quietly and without fanfare, simply because they could. Becoming a flight volunteer is much easier than most people imagine. If you’re already traveling, your journey could help a pet reach their new home.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { step: '1', title: 'Register Your Trip', desc: 'Simply share your upcoming flight details on the platform — including your departure city, destination, and travel date. This allows rescues and relocating families to find flights that match their pets’ travel needs.' },
              { step: '2', title: 'Get Matched With a Pet', desc: 'Once your trip is listed, rescue organizations or pet owners may contact you if your route matches a pet’s travel needs. You can also take the initiative by browsing the “Pets Needing Help” page and reaching out directly to owners or rescue groups whose pets need a flight volunteer on your route. They will handle the paperwork, health certificates, and airline requirements needed for the pet to travel.' },
              { step: '3', title: 'Meet Before the Flight', desc: 'Before departure, you will meet the rescue team or pet owner at the airport. They will guide you through the process and help check in the pet according to airline regulations.' },
              { step: '4', title: 'Fly as Usual', desc: 'During the journey, the pet typically travels safely in the cabin or cargo hold according to airline policies. As the volunteer, you simply travel as you normally would.' },
              { step: '5', title: 'A New Beginning', desc: 'When you arrive, a representative, adopter or the pet’s new family will meet you at the destination airport to receive the pet. In that moment, your trip becomes the final step in a life-changing journey for an animal who finally has a second chance.' }
            ].map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: '1.5rem', background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
                <div style={{ flexShrink: 0, width: '40px', height: '40px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {s.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>{s.title}</h3>
                  <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--color-surface)', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem' }}>One Flight. One Seat. One Life Changed.</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>By becoming a flight volunteer, your journey can mean more than just reaching a destination — it can help a rescued pet find the home they’ve been waiting for.</p>
          </div>
        </section>

        {/* ── Things to Know ── */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>Things to Know</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>At Flymypaws, we believe that a smooth journey starts with good preparation. Whether you're a pet owner entrusting your beloved companion to a volunteer, or a kind-hearted traveller opening your heart to help — here's what you should know before take-off.</p>
          
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>1. Extra Time at the Airport</h3>
              <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>Traveling with a pet may require a little additional time at the airport. You may need to arrive earlier than usual to complete check-in procedures, meet the pet owner or rescue representative, and ensure all documents and travel arrangements are properly handled. Planning for extra time can help reduce stress and avoid last-minute issues before your flight.</p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>2. Possible Questions from Authorities</h3>
              <p style={{ color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '1rem' }}>When traveling across borders with an animal, airport staff or customs officers may ask questions about the pet’s background and travel purpose. This is a normal procedure, as authorities need to ensure that all animal transport complies with import regulations and that there are no concerns related to illegal animal trade.</p>
              <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>As a volunteer, you may be asked basic questions such as where the pet is coming from, who the owner or rescue organization is, and who will receive the pet at the destination. Having the relevant documents and contact information prepared can help the process go smoothly.</p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>3. Verify and Communicate</h3>
              <p style={{ color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Trust is at the heart of everything we do at Flymypaws. For the safety of everyone involved, we strongly encourage both pet owners and volunteers to take the time to verify each other's identity and intentions before any arrangement is confirmed.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid var(--color-primary)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>For Pet Owners & Cares:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    <li style={{ marginBottom: '0.5rem' }}>Review volunteer profiles carefully and ask for identification if needed.</li>
                    <li style={{ marginBottom: '0.5rem' }}>Communicate clearly and share all relevant documents, medical records, and handling instructions well ahead of the travel date.</li>
                    <li>Stay in regular contact leading up to the journey — a well-informed volunteer is a confident one.</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>For Flight Volunteers:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    <li style={{ marginBottom: '0.5rem' }}>Don't hesitate to research the rescue organisation or pet travel agency you are working with. Ensuring that the organization is legitimate and experienced in pet relocation can help build trust and reduce potential risks.</li>
                    <li>Ask for documentation that verifies the animal's rescue background and health status.</li>
                  </ul>
                </div>
              </div>
              <p style={{ color: 'var(--color-text)', lineHeight: 1.6, marginTop: '1.5rem', fontWeight: 600, fontStyle: 'italic' }}>
                A little extra diligence goes a long way in ensuring every journey is safe, legal, and full of love — for the animals, and for everyone involved.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HowItWorks;
