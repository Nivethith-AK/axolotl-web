import React from 'react';
import { Link } from 'react-router-dom';

export const TechButton = ({
  to,
  href,
  children,
  variant = 'primary', // 'primary' (orange fill) or 'secondary' (outline / surface fill)
  className = '',
  onClick,
  ...props
}) => {
  const baseClass = `tech-btn tech-btn-${variant} ${className}`;

  const content = (
    <>
      <span className="tech-btn-prompt">&gt;&gt;</span>
      <span className="tech-btn-text">{children}</span>
    </>
  );

  // External link (http/https)
  if (href) {
    return (
      <a
        href={href}
        className={baseClass}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  // Internal client-side router link
  if (to) {
    return (
      <Link to={to} className={baseClass} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  // Standard interactive button
  return (
    <button type="button" className={baseClass} onClick={onClick} {...props}>
      {content}
    </button>
  );
};