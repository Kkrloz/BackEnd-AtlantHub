const botaoOptions = document.querySelector('.icon-user');
const navOptions = document.querySelector('.options-div');

botaoOptions.addEventListener('click', () => {
    navOptions.classList.add('ativo')
  })


document.addEventListener('click', (e) => {
  if (!navOptions.classList.contains('ativo')) return;
  if (e.target === botaoOptions || navOptions.contains(e.target)) return;
  if (navOptions.classList.contains('saindo')) return;
  navOptions.classList.add('saindo');
  navOptions.addEventListener(
    'animationend',
    () => {
      navOptions.classList.remove('saindo', 'ativo');
    },
    { once: true }
  );
});

const statusPedidos = document.querySelector('.ctg-pedidos');

