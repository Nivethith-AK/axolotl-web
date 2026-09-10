import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { WaveformHeader } from '../common/WaveformHeader';

export const ConnectSection = () => {
  const { t } = useLanguage();

  const handleEmailClick = (e) => {
    e.preventDefault();
    window.location.href = 'mailto:theaxolotlmusic@gmail.com';
  };

  return (
    <section id="connect" className="section">
      <div className="container-lg">
        <WaveformHeader
          title={t('connect.heading', 'Connect')}
          dataText="Connect"
          i18nKey="connect.heading"
        />
        <p data-i18n="connect.sub">
          {t('connect.sub', 'Establish a connection via preferred protocol //')}
        </p>

        <div className="connect-grid row gx-3 gy-3 mt-2">
          {/* Protocol 01: Email */}
          <div className="col-12 col-sm-6 col-lg-4">
            <a
              href="mailto:theaxolotlmusic@gmail.com"
              className="social-card"
              id="emailCard"
              onClick={handleEmailClick}
            >
              <div className="social-card-tag">PROTOCOL_01</div>
              <div className="social-platform-id">@</div>
              <div className="social-card-label" data-i18n="connect.email_label">
                {t('connect.email_label', 'EMAIL ME')}
              </div>
              <div className="social-card-sub">&gt;&gt; theaxolotlmusic@gmail.com</div>
            </a>
          </div>

          {/* Protocol 02: VGen */}
          <div className="col-12 col-sm-6 col-lg-4">
            <a
              href="https://vgen.co/theaxolotlmusic"
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
            >
              <div className="social-card-tag">PROTOCOL_02</div>
              <div className="connect-card-icon">
                <img
                  src="/images/icons/vgen_colour.webp"
                  alt="VGen"
                  className="connect-icon"
                  loading="lazy"
                  decoding="async"
                  width="40"
                  height="40"
                />
              </div>
              <div className="social-card-label" data-i18n="connect.commission_label">
                {t('connect.commission_label', 'COMMISSION ME')}
              </div>
              <div className="social-card-sub" data-i18n="connect.commission_sub">
                {t('connect.commission_sub', '>> VGen // Open for work')}
              </div>
            </a>
          </div>

          {/* Protocol 03: Discord */}
          <div className="col-12 col-sm-6 col-lg-4">
            <a
              href="https://discord.gg/QRRa4mxaAm"
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
            >
              <div className="social-card-tag">PROTOCOL_03</div>
              <div className="connect-card-icon">
                <img
                  src="/images/icons/discord.webp"
                  alt="Discord"
                  className="connect-icon"
                  loading="lazy"
                  decoding="async"
                  width="40"
                  height="40"
                />
              </div>
              <div className="social-card-label" data-i18n="connect.discord_label">
                {t('connect.discord_label', 'JOIN MY DISCORD SERVER')}
              </div>
              <div className="social-card-sub" data-i18n="connect.discord_sub">
                {t('connect.discord_sub', '>> X0:\\【Project:Eden】')}
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
