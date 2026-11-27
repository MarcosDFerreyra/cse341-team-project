
const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');
        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
}

const hookTripSchedules = async () => {
    const listEl = document.getElementById('schedules-list');
    const templateEl = document.getElementById('schedule-card-template');
    const monthSelect = document.getElementById('schedule-month-filter');
    const loadingEl = document.getElementById('schedules-loading');
    const emptyEl = document.getElementById('schedules-empty');
    const errorEl = document.getElementById('schedules-error');

    if (!listEl || !templateEl) {
        return;
    }

    const tripId = listEl.dataset.tripId;
    let latestRequest = 0;

    const showState = (state) => {
        loadingEl.hidden = state !== 'loading';
        emptyEl.hidden = state !== 'empty';
        errorEl.hidden = state !== 'error';
    };

    const renderSchedules = (schedules) => {
        const fragment = document.createDocumentFragment();

        schedules.forEach((schedule) => {
            const card = templateEl.content.cloneNode(true);
            const daysEl = card.querySelector('[data-field="days"]');

            card.querySelector('[data-field="departure"]').textContent = schedule.departureTime;
            card.querySelector('[data-field="arrival"]').textContent = schedule.arrivalTime;
            card.querySelector('[data-field="book-link"]').href = `/trips/booking/${schedule.id}`;

            schedule.daysOfWeek.forEach((day) => {
                const badge = document.createElement('span');

                badge.className = 'day-badge';
                badge.textContent = day.substring(0, 3);
                daysEl.append(badge);
            });

            fragment.append(card);
        });

        listEl.replaceChildren(fragment);
    };

    const loadSchedules = async (month) => {
        // Only the most recent request may update the page, even if responses arrive out of order.
        latestRequest += 1;
        const requestNumber = latestRequest;

        let url = `/api/trips/${encodeURIComponent(tripId)}/schedules`;
        if (month) {
            url += `?month=${encodeURIComponent(month)}`;
        }

        listEl.replaceChildren();
        showState('loading');

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load schedules (${response.status})`);
            }

            const schedules = await response.json();
            if (requestNumber !== latestRequest) {
                return;
            }

            renderSchedules(schedules);
            showState(schedules.length === 0 ? 'empty' : 'none');
        } catch (error) {
            if (requestNumber !== latestRequest) {
                return;
            }

            errorEl.textContent = 'Unable to load schedules right now. Please try again in a moment.';
            showState('error');
        }
    };

    if (monthSelect) {
        monthSelect.addEventListener('change', () => {
            loadSchedules(monthSelect.value);
        });
    }

    await loadSchedules(monthSelect ? monthSelect.value : '');
};

const hookTripGrid = async () => {
    const list = document.getElementById("trips-list");
    const template = document.getElementById("trips-card-template");
    const loading = document.getElementById("trips-loading");
    const errorTrip = document.getElementById("trips-error");

    if (!list || !template)
        return;

    try {
        const trips = await fetchTrips();
        applyFilters(trips);
        const regionSelect = document.getElementById('region-filter');
        const seasonSelect = document.getElementById('season-filter');

        if (regionSelect) {
            regionSelect.addEventListener('change', () => applyFilters(trips));
        }
        if (seasonSelect) {
            seasonSelect.addEventListener('change', () => applyFilters(trips));
        }
        if (loading) {
            loading.hidden = true;
        }
    }
    catch (error) {
        if (loading) {
            loading.hidden = true;
        }
        if (errorTrip) {
            errorTrip.hidden = false;
            errorTrip.textContent = 'Unable to load trips right now. Please try again in a moment.';
        }
    }
};

const applyFilters = (trips) => {
    const regionSelect = document.getElementById('region-filter');
    const seasonSelect = document.getElementById('season-filter');
    const list = document.getElementById('trips-list');
    if (regionSelect && seasonSelect) {
        const region = regionSelect.value;
        const season = seasonSelect.value
        const filter = trips.filter((trip) =>
            (region === 'all' || trip.region === region) &&
            (season === 'all' || trip.bestSeason === season)
        );

        list.replaceChildren(renderTrips(filter));

        const url = new URL(window.location.href);

        if (region === 'all') {
            url.searchParams.delete('region');
        } else {
            url.searchParams.set('region', region);
        }

        if (season === 'all') {
            url.searchParams.delete('season');
        } else {
            url.searchParams.set('season', season);
        }

        history.replaceState(null, '', url);
    }

};

const fetchTrips = async () => {
    const response = await fetch("/api/trips")
    if (!response.ok)
        throw new Error(`failed to load trips (${response.status})`);

    const response_json = await response.json();
    const trips = response_json;
    return trips;
};

const renderTrips = (trips) => {
    const template = document.getElementById("trips-card-template");
    const fragment = document.createDocumentFragment();

    trips.forEach((trip) => {
        const card = template.content.cloneNode(true);

        const cardEl = card.querySelector(".route-card");
        cardEl.classList.add(trip.region);

        card.querySelector(".view-details-btn").href = `/trips/${trip.id}`;

        card.querySelector(".route-name").textContent = trip.name;
        card.querySelector(".route-region").textContent = trip.region;
        card.querySelector(".start-station").textContent = trip.startStation;
        card.querySelector(".end-station").textContent = trip.endStation;
        card.querySelector(".duration-value").textContent = trip.duration;
        card.querySelector(".distance-value").textContent = trip.distance;

        card.querySelector(".season-badge").classList.add(`season-${trip.bestSeason}`);
        card.querySelector(".season-value").textContent = trip.bestSeason;

        card.querySelector(".route-description").textContent = trip.description;

        const highlightsList = card.querySelector(".highlights-list");
        (trip.highlights || []).forEach((highlight) => {
            const tag = document.createElement("span");
            tag.classList.add("highlight-tag");
            tag.textContent = highlight;
            highlightsList.appendChild(tag);
        });

        fragment.appendChild(card);

    });
    return fragment;
};
const hookUsersPage = async () => {
    const listEl = document.getElementById('users-list');
    const templateEl = document.getElementById('user-card-template');
    const loadingEl = document.getElementById('users-loading');
    const errorEl = document.getElementById('users-error');
    const emptyEl = document.getElementById('users-empty');

    if (!listEl || !templateEl) {
        return;
    }

    const currentUserId = listEl.dataset.currentUserId;

    const showError = (message) => {
        errorEl.hidden = false;
        errorEl.textContent = message;
    };

    const loadUsers = async () => {
        loadingEl.hidden = false;
        errorEl.hidden = true;
        emptyEl.hidden = true;
        listEl.replaceChildren();

        try {
            const response = await fetch('/api/users');

            if (!response.ok) {
                throw new Error(`Failed to load users (${response.status})`);
            }

            const users = await response.json();

            if (users.length === 0) {
                emptyEl.hidden = false;
                return;
            }

            const fragment = document.createDocumentFragment();

            users.forEach((user) => {
                const card = templateEl.content.cloneNode(true);

                card.querySelector('[data-field="display-name"]').textContent = user.display_name;
                card.querySelector('[data-field="username"]').textContent = user.username;
                card.querySelector('[data-field="email"]').textContent = user.email;
                card.querySelector('[data-field="role"]').textContent = user.role.name;

                const editForm = card.querySelector('[data-action="edit-form"]');

                editForm.elements.display_name.value = user.display_name;
                editForm.elements.username.value = user.username;
                editForm.elements.email.value = user.email;

                card.querySelector('[data-action="edit"]').addEventListener('click', () => {
                    editForm.hidden = !editForm.hidden;
                });

                card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
                    const confirmed = confirm(`Are you sure you want to delete ${user.display_name}?`);

                    if (!confirmed) {
                        return;
                    }

                    try {
                        const response = await fetch(`/api/users/${user._id}`, {
                            method: 'DELETE'
                        });

                        if (!response.ok) {
                            throw new Error('Failed to delete user');
                        }

                        if (user._id === currentUserId) {
                            window.location.href = '/login';
                            return;
                        }

                        await loadUsers();

                    } catch (error) {
                        showError('Unable to delete user. Please try again.');
                    }
                });

                card.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                    editForm.hidden = true;

                    editForm.elements.display_name.value = user.display_name;
                    editForm.elements.username.value = user.username;
                    editForm.elements.email.value = user.email;
                });

                editForm.addEventListener('submit', async (event) => {
                    event.preventDefault();

                    const updates = {
                        display_name: editForm.elements.display_name.value,
                        username: editForm.elements.username.value,
                        email: editForm.elements.email.value
                    };

                    try {
                        const response = await fetch(`/api/users/${user._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(updates)
                        });

                        if (!response.ok) {
                            throw new Error('Failed to update user');
                        }

                        await loadUsers();

                    } catch (error) {
                        showError('Unable to update user. Please try again.');
                    }
                });

                fragment.appendChild(card);
            });

            listEl.replaceChildren(fragment);

        } catch (error) {
            showError('Unable to load users. Please try again.');
        } finally {
            loadingEl.hidden = true;
        }
    };

    await loadUsers();
};


document.addEventListener('DOMContentLoaded', () => {
    hookTrainsCatalog();
    hookTripSchedules();
    hookTripGrid();
    hookUsersPage();
});
