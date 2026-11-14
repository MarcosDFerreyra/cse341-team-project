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

document.addEventListener('DOMContentLoaded', () => {
    hookTrainsCatalog();
    hookTripGrid();
});