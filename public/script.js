const calendar = document.getElementById('calendar');
const modalContainer = document.getElementById('viewModal');
const closeModalBtn = document.getElementById('closeViewModal');

const viewDate = document.getElementById('viewDate');
const eventList = document.getElementById('eventList');

const eventForm = document.getElementById('eventForm');
const toast = document.getElementById('toast');

let events = [];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function normalizeDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

async function fetchEvents() {
  try {
    const res = await fetch('http://localhost:3000/events');
    events = await res.json();
    renderCalendar(currentYear, currentMonth);
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
}

function renderCalendar(year, month) {
  calendar.innerHTML = '';

  // Navigation
  const nav = document.createElement('div');
  nav.style.gridColumn = 'span 7';
  nav.style.display = 'flex';
  nav.style.justifyContent = 'space-between';
  nav.style.alignItems = 'center';
  nav.style.marginBottom = '10px';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Previous';
  prevBtn.style.padding = '6px 12px';
  prevBtn.style.cursor = 'pointer';
  prevBtn.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  };

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next →';
  nextBtn.style.padding = '6px 12px';
  nextBtn.style.cursor = 'pointer';
  nextBtn.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  };

  const monthYearDisplay = document.createElement('div');
  monthYearDisplay.style.fontWeight = 'bold';
  monthYearDisplay.textContent = `${getMonthName(month)} ${year}`;

  nav.appendChild(prevBtn);
  nav.appendChild(monthYearDisplay);
  nav.appendChild(nextBtn);

  calendar.appendChild(nav);

  // Weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach(day => {
    const div = document.createElement('div');
    div.classList.add('weekday');
    div.innerText = day;
    calendar.appendChild(div);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement('div'));
  }

  for (let date = 1; date <= lastDate; date++) {
    const day = document.createElement('div');
    day.classList.add('day');
    day.innerText = date;

    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(date).padStart(2,'0')}`;

    const dayEvents = events.filter(e => normalizeDate(e.date) === dateStr);

    if (dayEvents.length > 0) {
      const dot = document.createElement('div');
      dot.classList.add('event-dot');
      day.appendChild(dot);
    }

    const today = new Date();
    if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      day.classList.add('today');
    }

    day.addEventListener('click', () => {
      openModal(dateStr);
    });

    calendar.appendChild(day);
  }
}

function getMonthName(monthIndex) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  return monthNames[monthIndex];
}

function openModal(dateStr) {
  viewDate.textContent = dateStr;
  renderEventList(dateStr);
  eventForm.reset();
  modalContainer.style.display = 'block';
}

function renderEventList(dateStr) {
  const dayEvents = events.filter(e => normalizeDate(e.date) === dateStr);
  eventList.innerHTML = '';
  if (dayEvents.length === 0) {
    eventList.innerHTML = '<li>No events for this day.</li>';
    return;
  }
  dayEvents.forEach(ev => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${ev.title}</strong><br>${ev.description || ''}`;
    eventList.appendChild(li);
  });
}

closeModalBtn.onclick = () => {
  modalContainer.style.display = 'none';
};

window.onclick = e => {
  if (e.target === modalContainer) {
    modalContainer.style.display = 'none';
  }
};

eventForm.addEventListener('submit', async e => {
  e.preventDefault();

  const newEvent = {
    date: viewDate.textContent,
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim()
  };

  if (!newEvent.title) {
    showToast('Please enter an event title.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    });

    if (!res.ok) throw new Error('Failed to add event');

    showToast('Event added successfully!');
    eventForm.reset();

    await fetchEvents();
    renderEventList(newEvent.date);
  } catch (err) {
    console.error(err);
    showToast('Error adding event.');
  }
});

function showToast(msg) {
  toast.textContent = msg;
  toast.className = 'toast show';
  setTimeout(() => (toast.className = 'toast'), 3000);
}

// Initial render
fetchEvents();
