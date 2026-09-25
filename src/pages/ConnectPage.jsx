import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ConnectSection } from '../components/connect/ConnectSection';
import { SOCIAL_LINKS } from '../components/common/SocialSidePanel';

export const ConnectPage = () => {
  const { t } = useLanguage();

  React.useEffect(() => {
    document.title = t('page_title.connect', 'Δxolotl // Connect');
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [t]);

  return (
    <main id="main-content" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div
        className="section"
        id="connectHeader"
        style={{ minHeight: 'unset', paddingTop: '82px', paddingBottom: '20px' }}
      >
        <div className="container-lg">
          <div className="works-header-tag" data-i18n="connect.header_tag">
            {t('connect.header_tag', 'COMMS_ARRAY // NEURAL_TRANSMISSION')}
          </div>
          <h2 className="glitch-burst" data-text="Connect" data-i18n="connect.heading">
            {t('connect.heading', 'Connect')}
          </h2>
          <div className="works-header-sub">
            Inquiries, commissions &amp; social platforms //
          </div>
        </div>
      </div>

      {/* Main Connect Protocols */}
      <ConnectSection />

      {/* Full Social Matrix Array */}
      <div className="container-lg" style={{ marginTop: '50px' }}>
        <div
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: '0.68rem',
            letterSpacing: '2px',
            color: 'var(--accent)',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          // GLOBAL_CHANNELS_MATRIX
        </div>

        <div className="row gx-3 gy-3">
          {SOCIAL_LINKS.map((link) => (
            <div key={link.label} className="col-6 col-sm-4 col-md-3">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--fg)',
                  textDecoration: 'none',
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--fg)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <img
                  src={link.icon}
                  alt={link.label}
                  width="18"
                  height="18"
                  style={{ objectFit: 'contain' }}
                />
                <span>{link.label}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Commission Terms of Service notice */}
        <div
          style={{
            marginTop: '40px',
            padding: '20px 24px',
            border: '1px solid var(--border-soft)',
            background: 'var(--surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: '0.64rem',
              color: 'var(--text-6)',
              lineHeight: '1.6',
            }}
          >
            Please review the comprehensive commission guidelines and commercial usage policy prior to contracting.
          </div>
          <Link
            to="/terms-of-service"
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '1px',
              padding: '8px 16px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--fg)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            &gt;&gt; TERMS OF SERVICE
          </Link>
        </div>
      </div>
    </main>
  );
};
