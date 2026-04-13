/**
 * Rivaansh Lifesciences — Location Hub Logic
 * Features: Geolocation, Reverse Geocoding (Nominatim), Leaflet Maps, Backend Storage
 */

let _locationMap = null;
let _locationMarker = null;

/**
 * Main function to detect user position
 */
async function detectUserLocation() {
    const btn = document.getElementById('getLocBtn');
    const statusBox = document.getElementById('locStatus');
    const latSpan = document.getElementById('latVal');
    const lngSpan = document.getElementById('lngVal');
    const addrDiv = document.getElementById('addrVal');

    if (!navigator.geolocation) {
        toast('Geolocation is not supported by your browser.', 'error');
        return;
    }

    // Update UI Loading State
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Accessing Satellites...';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;


            // 1. Update basic info
            latSpan.innerText = latitude.toFixed(6);
            lngSpan.innerText = longitude.toFixed(6);
            statusBox.classList.remove('hidden');

            // 2. Reverse Geocoding via Nominatim
            try {
                addrDiv.innerText = '⌛ Resolving address...';
                const address = await reverseGeocode(latitude, longitude);
                addrDiv.innerText = address;
                
                // 3. Update Map
                updateMap(latitude, longitude, address);

                // 4. Save to Backend (if user available)
                saveLocationToBackend(latitude, longitude, address);

                // 5. Add to local history
                addToLocationHistory(address);

                toast('Location verified successfully', 'success');
            } catch (err) {

                addrDiv.innerText = 'Error resolving address. Using coordinates only.';
                updateMap(latitude, longitude, 'Coordinates detected');
            }

            // Restore button
            btn.disabled = false;
            btn.innerHTML = '<i class="fa fa-map-pin"></i> Update Location';
        },
        (error) => {
            console.warn('GPS Error:', error.code);
            // IP Fallback
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(ipData => {
                    const { latitude, longitude, city, region, country_name } = ipData;
                    const addr = `${city}, ${region}, ${country_name} (Approximate)`;
                    
                    latSpan.innerText = latitude;
                    lngSpan.innerText = longitude;
                    addrDiv.innerText = addr;
                    statusBox.classList.remove('hidden');
                    
                    updateMap(latitude, longitude, addr);
                    saveLocationToBackend(latitude, longitude, addr, true);
                    toast('Using approximate IP location', 'info');
                })
                .catch(() => {
                    handleLocationError(error);
                })
                .finally(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa fa-map-pin"></i> Get My Location';
                });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

/**
 * Reverse Geocoding using free Nominatim API
 */
async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' }
    });
    if (!res.ok) throw new Error('OSM Registry unreachable');
    const data = await res.json();
    return data.display_name || 'Unnamed location';
}

/**
 * Leaflet Map Management
 */
function updateMap(lat, lng, label) {
    const container = document.getElementById('locMap');
    
    // Initialize map if not already done
    if (!_locationMap) {
        container.innerHTML = ''; // clear placeholder
        _locationMap = L.map('locMap').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(_locationMap);
    } else {
        _locationMap.setView([lat, lng], 15);
    }

    // Manage Marker
    if (_locationMarker) {
        _locationMarker.setLatLng([lat, lng]).setPopupContent(label).openPopup();
    } else {
        _locationMarker = L.marker([lat, lng]).addTo(_locationMap)
            .bindPopup(label).openPopup();
    }
}

/**
 * Backend Sync
 */
async function saveLocationToBackend(lat, lng, addr) {
    const user = JSON.parse(localStorage.getItem('rv_user') || 'null');
    try {
        const res = await fetch(`${API}/api/location/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: lat,
                longitude: lng,
                address: addr,
                userId: user ? user.uid : 'guest_session'
            })
        });
        const data = await res.json();

    } catch (err) {
        console.warn('Silent failure: could not sync location to backend.');
    }
}

function addToLocationHistory(address) {
    const historyList = document.getElementById('locationHistory');
    if (!historyList) return;

    if (historyList.querySelector('.empty-msg')) {
        historyList.innerHTML = '';
    }

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
        <div class="h-icon"><i class="fa fa-clock-rotate-left"></i></div>
        <div class="h-text">${address}</div>
    `;
    historyList.prepend(item);

    // Limit to 3 items
    while (historyList.children.length > 3) {
        historyList.lastChild.remove();
    }
}

function handleLocationError(error) {
    let msg = 'An unknown location error occurred.';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            msg = 'GPS permissions denied. Please enable location access in settings.';
            break;
        case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            msg = 'Geolocation request timed out.';
            break;
    }
    toast(msg, 'error');
    console.warn('Geolocation Error Code:', error.code);
}
