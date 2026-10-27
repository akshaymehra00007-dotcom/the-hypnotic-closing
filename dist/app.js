// Replace this with the confirmed booking URL when launch details are ready.
const BOOKING_URL = '';
const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('open', expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('open');
}));
const dialog = document.querySelector('#booking');
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  if (BOOKING_URL) {
    const link = document.querySelector('#booking-link');
    link.href = BOOKING_URL; link.hidden = false;
    document.querySelector('#booking-message').textContent = 'Choose a time to talk about your offer and sales conversations.';
    document.querySelector('.dialog-dismiss').hidden = true;
  }
  dialog.showModal();
}));
document.querySelectorAll('.dialog-close,.dialog-dismiss').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
document.querySelector('#year').textContent = new Date().getFullYear();
