const WEB_SOCKET_URL = "wss://wss.production.pokerpoint.co.uk";

let socket = null;
let currentRoomId = null;
let currentCards = [];
let userMap = {};
let voteStatusMap = {};
let selectedVote = null;
let pieChartInstance = null;

const joinRoomButton = document.getElementById('join-room-button');
const roomSection = document.getElementById('room-section');
const createRoomSection = document.getElementById('create-room-section');
const joinRoomSection = document.getElementById('join-room-section');
const roomNameDisplay = document.getElementById('room-name');
const currentCardDisplay = document.getElementById('current-card');
const participantsList = document.getElementById('participants-list');
const cardsContainer = document.getElementById('cards-container');


joinRoomButton.addEventListener('click', () => {
    autoJoinRoom()
});

function autoJoinRoom(ignore=false) {
    const roomId = document.getElementById('join-room-id').value.trim();
    const displayName = document.getElementById('join-display-name').value.trim();

    if(!ignore) {
        if (!roomId || !displayName) {
            alert('Please enter both room ID and display name.');
            return;
        }
    }

    showSpinner()

    localStorage.setItem('pokerPointDisplayName', displayName);

    onRoomJoined(roomId)

    socket = new WebSocket(WEB_SOCKET_URL);

    socket.onopen = () => {
        joinRoom(socket, roomId, displayName);
        currentRoomId = roomId;
        createRoomSection.classList.add('hidden');
        joinRoomSection.classList.add('hidden');
        roomSection.classList.remove('hidden');
    };

    socket.onmessage = (e) => {
        const message = JSON.parse(e.data);
        const event = message.event;
        const data = message.data;

        const castEstimatesPanel = document.getElementById('cast-estimates-panel');
        const votingClosedMessage = document.getElementById('voting-closed-message');
        const revealVotesButton = document.getElementById('show-votes-button');
        const jiraQuerySearch = document.getElementById('jira-query-section');
        const manualTicketEntry = document.getElementById('manual-ticket-entry');
        const jiraLinked = localStorage.getItem('jiraLinked');

        console.log("Received event:", event, data);

        switch (event) {
            case "state":
                roomNameDisplay.textContent = data.roomName;
                currentCardDisplay.textContent = data.card || "N/A";
                participantsList.innerHTML = '';
                userMap = {};
                voteStatusMap = {};
                selectedVote = null;

                const ownerUUID = data.ownerUUID;
                const userUUID = getOrCreateUUID();

                const setNewTask = document.getElementById('set-new-task');
                const revealVotes = document.getElementById('show-votes-button');

                if(ownerUUID === userUUID) {
                 //   setNewTask.classList.remove('hidden');
                    revealVotes.classList.remove('hidden');
                    manualTicketEntry.classList.remove('hidden');
                    showJira(roomId);
                } else {
                    //setNewTask.classList.add('hidden');
                    revealVotes.classList.add('hidden');
                    manualTicketEntry.classList.add('hidden');
                }

                data.participants.forEach(p => {
                    userMap[p.userId] = p.displayName;

                    const li = document.createElement('li');
                    li.className = 'flex items-center gap-3';
                    li.dataset.userId = p.userId;

                    const avatar = document.createElement('div');
                    avatar.className = 'bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold';
                    avatar.textContent = p.displayName.charAt(0).toUpperCase();

                    const name = document.createElement('span');
                    name.textContent = p.displayName;

                    li.appendChild(avatar);
                    li.appendChild(name);
                    participantsList.appendChild(li);
                });


               data.votes.forEach(vote => {
                    if (userMap[vote]) {
                        markUserVoted(vote);
                    }
                });


                currentCards = data.cards;

                currentCards = data.cards;
                renderCardButtons();

                hideSpinner()

                if(currentCardDisplay.textContent === "N/A") {
                    castEstimatesPanel.classList.add('disabled-overlay');
                    votingClosedMessage.classList.remove('hidden');
                    revealVotesButton.disabled = true;
                    revealVotesButton.classList.add('opacity-50', 'cursor-not-allowed');
                }

                break;

            case "user-join":
                if (userMap[data.userId]) {
                    break;
                }

                userMap[data.userId] = data.displayName;

                const liJoin = document.createElement('li');
                liJoin.className = 'flex items-center gap-3';
                liJoin.dataset.userId = data.userId;

                const avatar = document.createElement('div');
                avatar.className = 'bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold';
                avatar.textContent = data.displayName.charAt(0).toUpperCase();

                const nameSpan = document.createElement('span');
                nameSpan.textContent = data.displayName;

                liJoin.appendChild(avatar);
                liJoin.appendChild(nameSpan);
                participantsList.appendChild(liJoin);
                break;

            case "user-disconnect":
                const disconnectedUserId = data.userId;
                const disconnectedDisplayName = userMap[disconnectedUserId];

                if (disconnectedDisplayName) {
                    delete userMap[disconnectedUserId];
                    delete voteStatusMap[disconnectedUserId]

                    const li = participantsList.querySelector(`li[data-user-id="${disconnectedUserId}"]`);
                    if (li) {
                        participantsList.removeChild(li);
                    }
                }
                break;

            case "vote":
                const userId = data.userId;
                markUserVoted(userId);
                break;

            case "jira":
                renderJiraTickets(data.items)
                break;

            case "show":
                castEstimatesPanel.classList.add('disabled-overlay');
                votingClosedMessage.classList.remove('hidden');
                revealVotesButton.disabled = true;
                revealVotesButton.classList.add('opacity-50', 'cursor-not-allowed');

                clearAllUserVoteMarks()

                const voteCounts = {};
                const voteGroups = {};

                data.forEach(entry => {
                    const vote = entry.vote;
                    const userId = entry.userId;
                    const displayName = userMap[userId];
                    if(displayName) {
                        voteCounts[vote] = (voteCounts[vote] || 0) + 1;
                        if (!voteGroups[vote]) {
                            voteGroups[vote] = [];
                        }
                        voteGroups[vote].push(userId);
                    }
                });

                const chartData = {
                    labels: Object.keys(voteCounts),
                    datasets: [{
                        data: Object.values(voteCounts),
                        backgroundColor: [
                            '#6366f1', '#8b5cf6', '#4f46e5', '#7c3aed',
                            '#5eead4', '#2dd4bf', '#14b8a6', '#0f766e',
                        ],
                        borderColor: '#1F2937',
                        borderWidth: 2
                    }]
                };

                if (pieChartInstance) {
                    pieChartInstance.destroy();
                    pieChartInstance = null;
                }

                const ctx = document.getElementById('vote-pie-chart').getContext('2d');


                pieChartInstance = new Chart(ctx, {
                    type: 'pie',
                    data: chartData,
                    options: {
                        responsive: true,
                        animation: {
                            animateRotate: true,
                            animateScale: true,
                            easing: 'easeOutBounce'
                        },
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: '#E5E7EB',
                                    font: { size: 14 },
                                    padding: 20
                                }
                            },
                            tooltip: {
                                backgroundColor: '#111827',
                                titleColor: '#E5E7EB',
                                bodyColor: '#E5E7EB',
                                borderColor: '#14B8A6',
                                borderWidth: 1,
                                callbacks: {
                                    label: function (context) {
                                        const total = context.chart._metasets[0].total;
                                        const value = context.raw;
                                        const percent = ((value / total) * 100).toFixed(1);
                                        return `${context.label}: ${value} (${percent}%)`;
                                    }
                                }
                            }
                        }
                    }
                });

                const breakdownContainer = document.getElementById('vote-breakdown');
                breakdownContainer.innerHTML = '';
                Object.entries(voteGroups).forEach(([vote, userIds]) => {
                    const groupDiv = document.createElement('div');

                    groupDiv.innerHTML = `
    <div class="bg-gray-800/80 rounded-lg p-3 mb-3 border border-teal-500 shadow-sm">
        <div class="flex justify-between items-center mb-2">
            <h4 class="text-base font-bold text-teal-200">${vote}</h4>
            <span class="text-sm text-teal-300">${userIds.length} vote${userIds.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="flex flex-wrap gap-2">
            ${userIds.map(userId => `
                <span class="bg-teal-700/40 text-cyan-100 px-2 py-1 rounded-md text-xs font-medium">
                    ${userMap[userId]}
                </span>
            `).join('')}
        </div>
    </div>
`;

                    breakdownContainer.appendChild(groupDiv);
                });

                const modal = document.getElementById('vote-chart-modal');
                modal.classList.remove('hidden');

                document.getElementById('close-chart-modal').onclick = () => {
                    modal.classList.add('hidden');
                    if (pieChartInstance) {
                        pieChartInstance.destroy();
                        pieChartInstance = null;
                    }
                };

                selectedVote = null;
                renderCardButtons();
                hideSpinner();

                break;


            case "card":
                castEstimatesPanel.classList.remove('disabled-overlay');
                votingClosedMessage.classList.add('hidden');
                revealVotesButton.disabled = false;
                revealVotesButton.classList.remove('opacity-50', 'cursor-not-allowed');

                hideSpinner()
                clearAllUserVoteMarks()
                currentCardDisplay.textContent = data.name;
                voteStatusMap = {};
                selectedVote = null;
                renderCardButtons();
                break;
        }
    };

    socket.onclose = () => {
        leaveRoom();
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}

// leaveRoomButton.addEventListener('click', () => {
//     leaveRoom();
// });

function leaveRoom() {
    if (socket) {
        socket.close();
        socket = null;
    }
    localStorage.removeItem('jiraLinked');
    currentRoomId = null;
    currentCards = [];
    userMap = {};
    voteStatusMap = {};
    selectedVote = null;
    participantsList.innerHTML = '';

    cardsContainer.innerHTML = '';
    roomNameDisplay.textContent = '';
    currentCardDisplay.textContent = 'N/A';
    roomSection.classList.add('hidden');
    createRoomSection.classList.remove('hidden');
    joinRoomSection.classList.add('hidden');

    document.getElementById('show-create-room').classList.add('active');
    document.getElementById('show-join-room').classList.remove('active');
    document.getElementById('create-room-name').value = '';
    document.getElementById('create-cards').value = '';
    document.getElementById('create-room-response').textContent = '';
    document.getElementById('join-room-id').value = '';
    document.getElementById('join-display-name').value = '';
}

function renderCardButtons() {
    cardsContainer.innerHTML = '';
    currentCards.forEach(cardValue => {
        const button = document.createElement('button');
        button.className = `card-button text-indigo-300 font-semibold py-2 px-4 rounded-lg ${cardValue === selectedVote ? 'selected' : ''}`;
        button.textContent = cardValue;
        button.addEventListener('click', () => {
            selectedVote = cardValue;
            vote(socket, currentRoomId, cardValue);
            renderCardButtons();
        });
        cardsContainer.appendChild(button);
    });
}

// document.getElementById('set-card-button').addEventListener('click', () => {
//     const cardName = document.getElementById('card-name').value.trim();
//     if (!cardName) {
//         alert("Please enter a card name.");
//         return;
//     }
//     setCard(socket, currentRoomId, cardName);
// });

document.getElementById('show-votes-button').addEventListener('click', () => {
    showSpinner()
    show(socket, currentRoomId);
});

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('roomId');
    const jira = params.get('jira');

    if (roomId) {
        createRoomSection.classList.add('hidden');
        joinRoomSection.classList.remove('hidden');
        document.getElementById('show-create-room').classList.remove('active');
        document.getElementById('show-join-room').classList.add('active');
        document.getElementById('join-room-id').value = roomId;
    }

    if(jira) {
        localStorage.setItem('jiraLinked', jira);
    } else {
        localStorage.removeItem("jiraLinked")
    }

    const savedName = localStorage.getItem('pokerPointDisplayName');
    if (savedName) {
        document.getElementById('join-display-name').value = savedName;
    }

    if(roomId && savedName) {
        autoJoinRoom()
    }
});

function setEstimationValues(values) {
    document.getElementById('create-cards').value = values;
}

function setupRoomUrlVoteSection(roomId) {
    if (!roomId) {
        return;
    }

    const roomUrlContainer = document.getElementById('room-url-container-vote');
    const roomUrlInput = document.getElementById('room-url-vote');
    const copyButton = document.getElementById('copy-room-url-vote');

    roomUrlInput.value = `${window.location.origin}/app/index.html?roomId=${encodeURIComponent(roomId)}`;
    roomUrlContainer.classList.remove('hidden');

    copyButton.onclick = () => {
        roomUrlInput.select();
        roomUrlInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy';
        }, 2000);
    };
}

function onRoomJoined(roomId) {
    setupRoomUrlVoteSection(roomId);
}

function markUserVoted(userId) {
    const participantItem = participantsList.querySelector(`li[data-user-id="${userId}"]`);
    if (!participantItem) {
        return;
    }
    if (!participantItem.querySelector('.vote-tick')) {
        const tick = document.createElement('span');
        tick.classList.add('vote-tick', 'text-green-400', 'ml-2');
        tick.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        `;

        const nameSpan = participantItem.querySelector('span');

        if (nameSpan) {
            nameSpan.appendChild(tick);
        } else {
            participantItem.appendChild(tick);
        }
    }
}

function clearAllUserVoteMarks() {
    participantsList
        .querySelectorAll('.vote-tick')
        .forEach(tick => tick.remove());
}

function showSpinner() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideSpinner() {
    document.getElementById('loading-spinner').classList.add('hidden');
}

function showJira(roomId) {
    const jiraLinked = localStorage.getItem('jiraLinked');
    const container = document.getElementById('jira-integration-section');

    if (jiraLinked) {
        container.innerHTML = `
            <section class="bg-gray-800/50 rounded-2xl p-6 shadow-md" id="jira-query-section">
                <h3 class="text-xl sm:text-2xl font-semibold text-gray-200 mb-5">Import from Jira</h3>
                <div class="flex flex-col sm:flex-row gap-4">
                    <input type="text" id="jira-jql-input" placeholder="Enter JQL, e.g., project=MYPROJ AND status=ToDo"
                        class="flex-1 px-5 py-3 bg-gray-900/70 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200" />
                    <button id="fetch-jira-tickets"
                        class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-md">
                        Fetch Tickets
                    </button>
                </div>
            </section>
        `;

        document.getElementById('fetch-jira-tickets').addEventListener('click', async () => {
            const jql = document.getElementById('jira-jql-input').value.trim();
            if (!jql) {
                alert('Please enter a JQL query');
                return;
            }

            const jiraLinked = localStorage.getItem('jiraLinked');

            if (!jiraLinked) {
                console.log("Jira not linked, starting authentication")
                startJiraAuth(currentRoomId);
                return;
            }

            try {
                showSpinner();
                await fetchJiraTickets(jql, currentRoomId);
            } catch (error) {
                alert(`Error fetching tickets: ${error.message}`);
            }
        });

    } else {
        container.innerHTML = `
            <button id="link-jira-button"
                class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md">
                Link Jira
            </button>
        `;

        document.getElementById('link-jira-button').addEventListener('click', () => {
            startJiraAuth(roomId)
        });
    }
}


function startJiraAuth(roomId) {
    const clientId = 'HDIuLGOg69GDy95TMXopOPGXJAdN0sdf';
    const redirectUri = encodeURIComponent('https://api.production.pokerpoint.co.uk/jira/callback');
    const scope = encodeURIComponent('read:jira-work');
    const state = encodeURIComponent(getOrCreateUUID() + ":" + roomId);
    window.location.href = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}&response_type=code&prompt=consent`;
}
