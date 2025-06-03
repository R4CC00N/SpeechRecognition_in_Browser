
// Abrir demos en una nueva pestaña al hacer click o tecla Enter
const demos = document.querySelectorAll('.demo-item');
demos.forEach(demo => {
    demo.addEventListener('click', () => {
        const url = demo.getAttribute('data-url');
        window.open(url, '_blank', 'noopener');
    });
    demo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            demo.click();
        }
    });
});
function accederDemo(url) {
  window.open(url, '_blank', 'noopener');
}
