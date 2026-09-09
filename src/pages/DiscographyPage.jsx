import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DISCO_DATA, getDiscoSlug } from '../data/discographyData';
import { DiscoTimeline } from '../components/discography/DiscoTimeline';
import { DiscoModal } from '../components/discography/DiscoModal';

export const DiscographyPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    document.title = t('page_title.discography', 'Δxolotl // Discography');
  }, [t]);

  // Deep-link check on mount or param change
  useEffect(() => {
    if (slug) {
      const match = DISCO_DATA.find((d) => getDiscoSlug(d) === slug);
      if (match) {
        setSelectedTrack(match);
      }
    } else {
      setSelectedTrack(null);
    }
  }, [slug]);

  const handleSelectTrack = (track) => {
    const trackSlug = getDiscoSlug(track);
    navigate(`/discography/${trackSlug}`);
  };

  const handleCloseModal = () => {
    navigate('/discography');
  };

  return (
    <main id="main-content">
      <DiscoTimeline
        onSelectTrack={handleSelectTrack}
        isModalOpen={!!selectedTrack}
      />
      {selectedTrack && (
        <DiscoModal track={selectedTrack} onClose={handleCloseModal} />
      )}
    </main>
  );
};
