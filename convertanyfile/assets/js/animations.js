/**
 * ConvertAnyFile - 3D Background & Hover Micro-Interactions
 */

document.addEventListener('mousemove', (e) => {
  const cards = document.querySelectorAll('.tool-card-3d');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    if (Math.abs(x) < 200 && Math.abs(y) < 200) {
      card.style.transform = `perspective(600px) rotateX(${-y * 0.04}deg) rotateY(${x * 0.04}deg) translateY(-4px)`;
    } else {
      card.style.transform = '';
    }
  });
});
