import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 800 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Last Updated: March 2026</p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>1. Information Collection</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            We collect information you provide when you register or use our services. This may include your name, email address, and other personal information you choose to provide while using FlyMyPaws.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>2. Use of Information</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            We use the information we collect to provide, maintain, and improve our services. This includes helping you post requests for help, matching you with flight volunteers, and facilitating communication with other users.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>3. Information Sharing</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            We do not sell your personal information to third parties. Some of your data (like your public profile and posted requests) will be visible to other users on the platform to achieve the purpose of flight matching.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>4. Your Rights</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            You can view, update, or delete your personal information at any time in your account settings. If you wish to permanently delete your account, please contact us.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>5. Contact Us</h2>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            If you have any questions about this Privacy Policy, please contact us at: kxiaaaaa@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
