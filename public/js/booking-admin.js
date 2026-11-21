// Booking admin page: loads bookings from the API and lets the user
// edit or delete them without reloading the page.

const listEl = document.getElementById('bookings-list');
const tableEl = document.getElementById('bookings-table');
const rowTemplate = document.getElementById('booking-row-template');
const loadingEl = document.getElementById('bookings-loading');
const errorEl = document.getElementById('bookings-error');
const emptyEl = document.getElementById('bookings-empty');
const statusEl = document.getElementById('bookings-status');

const dialog = document.getElementById('booking-edit-dialog');
const form = document.getElementById('booking-edit-form');
const passengersEl = document.getElementById('edit-passengers');
const editErrorEl = document.getElementById('edit-error');

// The bookings from the last API call, by id, so the edit form can be filled.
let bookingsById = new Map();
let editingId = null;

const showStatus = (message) => {
    statusEl.textContent = message;
};

// If the session expired, the API returns 401: send the user to the login page.
const handleUnauthorized = (response) => {
    if (response.status === 401) {
        window.location.href = '/login';
        return true;
    }
    return false;
};

const readError = async (response) => {
    try {
        const body = await response.json();
        if (body.details) return `${body.error}: ${body.details.join('; ')}`;
        return body.error || body.message || `Request failed (${response.status})`;
    } catch {
        return `Request failed (${response.status})`;
    }
};

const formatPassengers = (passengers = []) =>
    passengers.map((p) => `${p.firstName} ${p.lastName} (${p.email})`).join(', ');

const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? ''
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const renderBookings = (bookings) => {
    bookingsById = new Map(bookings.map((booking) => [booking.id, booking]));
    const fragment = document.createDocumentFragment();

    bookings.forEach((booking) => {
        const row = rowTemplate.content.cloneNode(true);
        row.querySelector('[data-field="id"]').textContent = booking.id;
        row.querySelector('[data-field="trip"]').textContent = booking.tripId || '';
        row.querySelector('[data-field="day"]').textContent = booking.selectedDay || '';
        row.querySelector('[data-field="class"]').textContent = booking.ticketClass || '';
        row.querySelector('[data-field="passengers"]').textContent = formatPassengers(booking.passengers);
        row.querySelector('[data-field="created"]').textContent = formatDate(booking.createdAt);
        row.querySelector('[data-action="edit"]').dataset.id = booking.id;
        row.querySelector('[data-action="delete"]').dataset.id = booking.id;
        fragment.appendChild(row);
    });

    listEl.replaceChildren(fragment);
    tableEl.hidden = bookings.length === 0;
    emptyEl.hidden = bookings.length !== 0;
};

const loadBookings = async () => {
    errorEl.hidden = true;
    try {
        const response = await fetch('/api/bookings', { headers: { Accept: 'application/json' } });
        if (handleUnauthorized(response)) return;
        if (!response.ok) throw new Error(await readError(response));
        renderBookings(await response.json());
    } catch (error) {
        errorEl.textContent = `Could not load bookings. ${error.message}`;
        errorEl.hidden = false;
    } finally {
        loadingEl.hidden = true;
    }
};

const passengerFieldset = (passenger, index) => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = `Passenger ${index + 1}`;
    fieldset.appendChild(legend);

    [
        ['firstName', 'First name', 'text', true],
        ['lastName', 'Last name', 'text', true],
        ['email', 'Email', 'email', true],
        ['phone', 'Phone', 'tel', false]
    ].forEach(([field, labelText, type, required]) => {
        const id = `edit-passenger-${index}-${field}`;
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;
        const input = document.createElement('input');
        input.id = id;
        input.type = type;
        input.dataset.index = index;
        input.dataset.field = field;
        input.value = passenger[field] || '';
        input.required = required;
        fieldset.append(label, input);
    });

    return fieldset;
};

const openEditDialog = (id) => {
    const booking = bookingsById.get(id);
    if (!booking) return;

    editingId = id;
    document.getElementById('edit-booking-id').textContent = id;
    form.elements.ticketClass.value = booking.ticketClass || 'standard';
    form.elements.selectedDay.value = booking.selectedDay || 'monday';
    passengersEl.replaceChildren(...(booking.passengers || []).map(passengerFieldset));
    editErrorEl.hidden = true;
    dialog.showModal();
};

const readPassengersFromForm = () => {
    const passengers = [];
    passengersEl.querySelectorAll('input').forEach((input) => {
        const index = Number(input.dataset.index);
        passengers[index] = passengers[index] || {};
        passengers[index][input.dataset.field] = input.value.trim();
    });
    return passengers;
};

const saveBooking = async (event) => {
    event.preventDefault();
    const changes = {
        ticketClass: form.elements.ticketClass.value,
        selectedDay: form.elements.selectedDay.value,
        passengers: readPassengersFromForm()
    };

    const response = await fetch(`/api/bookings/${encodeURIComponent(editingId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(changes)
    });
    if (handleUnauthorized(response)) return;

    if (!response.ok) {
        editErrorEl.textContent = await readError(response);
        editErrorEl.hidden = false;
        return;
    }

    dialog.close();
    showStatus(`Booking ${editingId} was updated.`);
    await loadBookings();
};

const deleteBooking = async (id) => {
    if (!window.confirm(`Delete booking ${id}? This cannot be undone.`)) return;

    const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (handleUnauthorized(response)) return;

    if (response.status !== 204) {
        showStatus(`Could not delete booking ${id}. ${await readError(response)}`);
        return;
    }

    showStatus(`Booking ${id} was deleted.`);
    await loadBookings();
};

// One click listener for the whole table (event delegation), so the rows
// still work after the list is rebuilt.
listEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    if (button.dataset.action === 'edit') openEditDialog(button.dataset.id);
    if (button.dataset.action === 'delete') deleteBooking(button.dataset.id);
});

form.addEventListener('submit', saveBooking);
document.getElementById('edit-cancel').addEventListener('click', () => dialog.close());

loadBookings();
