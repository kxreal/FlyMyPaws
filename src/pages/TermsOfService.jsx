import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 800 }}>Terms of Service</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Last Updated: March 2026</p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            Welcome to FlyMyPaws. By accessing or using our platform, you signify that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>2. Nature of Platform</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            FlyMyPaws acts solely as an information-sharing platform to connect users who need pet transportation assistance with willing flight volunteers. We do not assume any warranties or direct responsibilities in this matching process, including but not limited to the risks of pet transportation and financial disputes.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>3. User Conduct</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            You agree not to use the service for any illegal or unauthorized purpose. All information posted must be truthful and accurate. Users are solely responsible for all content they post and share.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>4. Disclaimer</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            Any transactions, agreements, or arrangements made between users on the platform are strictly private matters between the parties involved. FlyMyPaws shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of the service.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>5. Modifications to Terms</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            We reserve the right to modify or replace these Terms at any time. We will provide prominent notice on our website of any material changes. Your continued use of the service constitutes acceptance of those changes.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
