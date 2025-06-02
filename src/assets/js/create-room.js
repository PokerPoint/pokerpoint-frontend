const API_BASE_URL = 'https://api.production.pokerpoint.co.uk';

document.getElementById('create-room-button').addEventListener('click', async () => {
    const roomName = document.getElementById('create-room-name').value.trim();
    const cardsRaw = document.getElementById('create-cards').value.trim();
    const cards = cardsRaw.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const userUUID = getOrCreateUUID();

    if (!roomName || cards.length === 0) {
        alert('Please enter a room name and at least one card.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/create-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName: roomName, cards: cards, userUUID: userUUID })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Error: ' + (errorData.message || 'Unknown error'));
            return;
        }

        const data = await response.json();
        const responseEl = document.getElementById('create-room-response');
        const urlContainer = document.getElementById('room-url-container');
        const roomUrlInput = document.getElementById('room-url');
        const copyButton = document.getElementById('copy-room-url');

        responseEl.innerHTML = `<span class="text-green-400 font-semibold">Room created!</span> Share the link below:`;
        roomUrlInput.value = `${window.location.origin}/app/index.html?roomId=${data.roomId}`;
        urlContainer.classList.remove('hidden');

        document.getElementById('join-room-id').value = data.roomId;

        copyButton.textContent = 'Copy';
        copyButton.onclick = () => {
            roomUrlInput.select();
            document.execCommand('copy');
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 2000);
        };

        const savedName = localStorage.getItem('pokerPointDisplayName');
        if(savedName) {
            await autoJoinRoom(true)
        }

    } catch (err) {
        alert('Request failed: ' + err.message);
    }
});

function getOrCreateUUID() {
    let uuid = localStorage.getItem('userUUID');
    if (!uuid) {
        uuid = crypto.randomUUID();
        localStorage.setItem('userUUID', uuid);
    }
    return uuid;
}
