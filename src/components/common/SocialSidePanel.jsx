import React from 'react';

export const SOCIAL_LINKS = [
  {
    href: 'https://youtube.com/@theaxolotlmusic?sub_confirmation=1',
    label: 'YOUTUBE',
    icon: '/images/icons/youtube.png',
    alt: 'YouTube',
  },
  {
    href: 'https://open.spotify.com/artist/7MlnwvPwl6GG7oOlYqCFbe',
    label: 'SPOTIFY',
    icon: '/images/icons/spotify.png',
    alt: 'Spotify',
  },
  {
    href: 'https://music.apple.com/lk/artist/%CE%B4xolotl/1651143074',
    label: 'APPLE MUSIC',
    icon: '/images/icons/applemusic.png',
    alt: 'Apple Music',
  },
  {
    href: 'https://soundcloud.com/theaxolotlmusic',
    label: 'SOUNDCLOUD',
    icon: '/images/icons/soundcloud.png',
    alt: 'SoundCloud',
  },
  {
    href: 'https://nico.ms/user/131725197',
    label: 'NICO NICO',
    icon: '/images/icons/niconico.png',
    alt: 'Nico Nico',
  },
  {
    href: 'https://vgen.co/theaxolotlmusic',
    label: 'VGEN',
    icon: '/images/icons/vgen.png',
    alt: 'VGen',
  },
  {
    href: 'https://twitter.com/theaxolotlmusic',
    label: 'TWITTER / X',
    icon: '/images/icons/twitter.png',
    alt: 'Twitter',
  },
  {
    href: 'https://instagram.com/theaxolotlmusic',
    label: 'INSTAGRAM',
    icon: '/images/icons/instagram.png',
    alt: 'Instagram',
  },
  {
    href: 'https://discord.gg/QRRa4mxaAm',
    label: 'DISCORD',
    icon: '/images/icons/discord.png',
    alt: 'Discord',
  },
  {
    href: 'https://genius.com/artists/theaxolotlmusic',
    label: 'GENIUS',
    icon: '/images/icons/genius.png',
    alt: 'Genius',
  },
];

export const SocialSidePanel = () => {
  return (
    <div className="social-side-panel" id="socialSidePanel">
      <div className="side-panel-tag">SYS_LINKS</div>
      <div className="side-panel-divider"></div>
      <div className="side-panel-icons">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="side-icon-link"
            data-label={link.label}
          >
            <div className="side-icon-circle">
              <img
                src={link.icon}
                alt={link.alt}
                className="side-icon"
                width="20"
                height="20"
                decoding="async"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
