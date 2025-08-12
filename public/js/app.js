const calendar = document.getElementById('calendar');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalDate = document.getElementById('modalDate');
const eventForm = document.getElementById('eventForm');
const eventList = document.getElementById('eventList');
const monthLabel = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let selectedDate = '';
let currentYear, currentMonth;

function initCalendar() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    renderCalendar();
}

function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevLastDate = new Date(currentYear, currentMonth, 0).getDate();

    monthLabel.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

    calendar.innerHTML = '';

    // Previous month's days
    for (let i = firstDay; i > 0; i--) {
        const dateStr = formatDate(currentYear, currentMonth - 1, prevLastDate - i + 1);
        createDayCell(prevLastDate - i + 1, dateStr, true);
    }

    // Current month's days
    for (let day = 1; day <= lastDate; day++) {
        const dateStr = formatDate(currentYear, currentMonth, day);
        createDayCell(day, dateStr, false);
    }

    // Next month's days to fill grid
    const totalCells = calendar.children.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainingCells; i++) {
        const dateStr = formatDate(currentYear, currentMonth + 1, i);
        createDayCell(i, dateStr, true);
    }
}

function createDayCell(day, dateStr, otherMonth) {
    const div = document.createElement('div');
    div.classList.add('day');
    if (otherMonth) div.classList.add('other-month');
    div.textContent = day;
    div.onclick = () => openModal(dateStr);
    calendar.appendChild(div);
}

function formatDate(year, month, day) {
    const d = new Date(year, month, day);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function openModal(date) {
    selectedDate = date;
    modalDate.textContent = `Events on ${date}`;
    loadEvents(date);
    modal.classList.remove('hidden');
}

function closeModalFunc() {
    modal.classList.add('hidden');
}

function loadEvents(date) {
    fetch('/api/events')
        .then(res => res.json())
        .then(data => {
            eventList.innerHTML = '';
            const events = data.filter(ev => ev.date === date);
            if (events.length === 0) {
                eventList.innerHTML = '<li>No events</li>';
            } else {
                events.forEach(ev => {
                    const li = document.createElement('li');
                    li.textContent = ev.title;
                    li.onclick = () => {
                        if (confirm('Delete this event?')) {
                            fetch(`/api/events/${ev.id}`, { method: 'DELETE' })
                                .then(() => loadEvents(date));
                        }
                    };
                    eventList.appendChild(li);
                });
            }
        });
}

eventForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date: selectedDate })
    }).then(() => {
        eventForm.reset();
        loadEvents(selectedDate);
    });
});

prevMonthBtn.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
};

nextMonthBtn.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
};

closeModal.onclick = closeModalFunc;
window.onclick = e => {
    if (e.target === modal) closeModalFunc();
};

initCalendar();
