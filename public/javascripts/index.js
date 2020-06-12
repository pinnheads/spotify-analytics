// Navbar
$(document).ready(function () {
  $('.pushable').css('height', 'auto');
});

$('.ui.sidebar')
  .sidebar({
    context: $('.ui.pushable.segment'),
    transition: 'overlay',
  })
  .sidebar('attach events', '#mobile_item');

// Navbar Highlight
const heading = document.querySelectorAll('#page-heading')[0].textContent;
const navItems = document.querySelectorAll('a.item');
navItems.forEach((item) => {
  if (item.textContent === heading) {
    console.log('done');
    item.classList.add('green');
    item.classList.add('active');
  } else {
    console.log('Not found');
  }
});

// Number Formatting
var numbers = document.querySelectorAll('.followers');

function numberWithCommas(x) {
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, '$1,$2');
  return x;
}

numbers.forEach((item) => {
  var result = numberWithCommas(item.textContent);
  item.textContent = result;
});

// For Song Duration
const milliseconds = document.querySelectorAll('.duration');
milliseconds.forEach((ms) => {
  var result = msToMinutesAndSeconds(ms.textContent);
  ms.textContent = result;
});

function msToMinutesAndSeconds(ms) {
  var minutes = Math.floor(ms / 60000);
  var seconds = ((ms % 60000) / 1000).toFixed(0);
  return seconds == 60
    ? minutes + 1 + ':00'
    : minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

// Hover Effect
$('.special.cards .image').dimmer({
  on: 'hover',
});
