document.addEventListener('DOMContentLoaded', () => {
    const createRoomSection = document.getElementById('create-room-section');
    const joinRoomSection = document.getElementById('join-room-section');
    const createRoomButton = document.getElementById('show-create-room');
    const joinRoomButton = document.getElementById('show-join-room');
    const setupSection = document.getElementById('setup-section');
    const roomSection = document.getElementById('room-section');

    createRoomSection.classList.remove('hidden');
    joinRoomSection.classList.add('hidden');
    createRoomButton.classList.add('active');

    createRoomButton.addEventListener('click', () => {
        createRoomSection.classList.remove('hidden');
        joinRoomSection.classList.add('hidden');
        createRoomButton.classList.add('active');
        joinRoomButton.classList.remove('active');
    });

    joinRoomButton.addEventListener('click', () => {
        joinRoomSection.classList.remove('hidden');
        createRoomSection.classList.add('hidden');
        joinRoomButton.classList.add('active');
        createRoomButton.classList.remove('active');
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (!roomSection.classList.contains('hidden')) {
                    setupSection.classList.add('hidden');
                } else {
                    setupSection.classList.remove('hidden');
                    const roomSection = document.getElementById("room-section");
                    roomSection.classList.remove("hidden");
                    setTimeout(() => {
                        roomSection.classList.remove("translate-y-10", "opacity-0");
                        roomSection.classList.add("translate-y-0", "opacity-100");
                    }, 50);
                }
            }
        });
    });

    observer.observe(roomSection, { attributes: true });
});
