const docTop = (el) => {
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  return y;
};

export const getHeaderHeight = () =>
  document.getElementById('mainNav')?.offsetHeight ?? 75;

export function scrollToSection(id, { duration = 1.4 } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;

  el.classList.add('is-visible');
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';

  const DIVIDER = 2; // section's 2px border tucks under the navbar's own 2px border
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const target = () => id === 'hero'? 0 : Math.min(maxScroll(), Math.max(0, docTop(el) - getHeaderHeight() + DIVIDER));

  const lenis = window.lenis;
  if (!lenis) {
    window.scrollTo({ top: target(), behavior: 'smooth' });
    return true;
  }

  const settle = (tries = 0) => {
    if (tries >= 3) return;
    if (Math.abs(target() - window.scrollY) > 1) {
      lenis.scrollTo(target(), {
        duration: 0.4,
        onComplete: () => settle(tries + 1),
      });
    }
  };

  lenis.scrollTo(target(), { duration, onComplete: () => settle() });
  return true;
}