const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }
            
            window.location.href = url.toString();
        });
    }
};

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
};

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

document.addEventListener('DOMContentLoaded', () => {
    hookRegionSorter();
    hookSeasonSorter();
    hookTrainsCatalog();
    hookTripSchedules();
});