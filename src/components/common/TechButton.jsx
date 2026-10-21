import React from 'react';
import { Link } from 'react-router-dom';

export const TechButton = ({
  to,
  href,
  children,
  variant = 'primary', // 'primary' or 'secondary'
  size = 'md',          // 'sm', 'md', 'lg'
  className = '',
  onClick,
  ...props
}) => {
  const baseClass = `tech-btn tech-btn-${variant} tech-btn-${size} ${className}`;

  const content = (
    <>
      <span className="tech-btn-prompt">&gt;&gt;</span>
      <span className="tech-btn-text">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseClass} target="_blank" rel="noopener noreferrer" onClick={onClick} {...props}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={baseClass} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={baseClass} onClick={onClick} {...props}>
      {content}
    </button>
  );
};