// Loads the signed-in user's bookings from the API and shows them on the dashboard.
const hookUserBookings = async () => {
    const listEl = document.getElementById('bookings-list');
    const templateEl = document.getElementById('booking-card-template');
    const loadingEl = document.getElementById('bookings-loading');
    const emptyEl = document.getElementById('bookings-empty');
    const errorEl = document.getElementById('bookings-error');

    if (!listEl || !templateEl) {
        return;
    }

    const showState = (state) => {
        loadingEl.hidden = state !== 'loading';
        emptyEl.hidden = state !== 'empty';
        errorEl.hidden = state !== 'error';
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderBookings = (bookings) => {
        const fragment = document.createDocumentFragment();

        bookings.forEach((booking) => {
            const card = templateEl.content.cloneNode(true);

            card.querySelector('[data-field="trip-name"]').textContent = booking.tripName;
            card.querySelector('[data-field="reference"]').textContent = booking.id;
            card.querySelector('[data-field="day"]').textContent = booking.selectedDay;
            card.querySelector('[data-field="ticket-class"]').textContent = booking.ticketClass;
            card.querySelector('[data-field="passengers"]').textContent = booking.passengerCount;
            card.querySelector('[data-field="booked-on"]').textContent = formatDate(booking.createdAt);
            card.querySelector('[data-field="confirmation-link"]').href = `/trips/confirmation/${encodeURIComponent(booking.id)}`;

            fragment.append(card);
        });

        listEl.replaceChildren(fragment);
    };

    showState('loading');

    try {
        const response = await fetch('/api/users/me/bookings');

        if (response.status === 401) {
            errorEl.textContent = 'Your session has expired. Please log in again.';
            showState('error');
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load bookings (${response.status})`);
        }

        const bookings = await response.json();

        renderBookings(bookings);
        showState(bookings.length === 0 ? 'empty' : 'none');
    } catch (error) {
        errorEl.textContent = 'Unable to load your bookings right now. Please try again in a moment.';
        showState('error');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    hookUserBookings();
});
