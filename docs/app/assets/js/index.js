/**
 * Configuration constants for the PokerPoint application
 * @constant
 */
const CONFIG = {
    API_BASE_URL: 'https://api.production.pokerpoint.co.uk',
    WEB_SOCKET_URL: 'wss://wss.production.pokerpoint.co.uk',
    JIRA_CLIENT_ID: 'HDIuLGOg69GDy95TMXopOPGXJAdN0sdf',
    JIRA_REDIRECT_URI: 'https://api.production.pokerpoint.co.uk/jira/callback',
    JIRA_SCOPE: 'read:jira-work',
    COPY_BUTTON_RESET_DELAY: 2000,
    CHART_COLORS: [
        '#6366f1', '#8b5cf6', '#4f46e5', '#7c3aed',
        '#5eead4', '#2dd4bf', '#14b8a6', '#0f766e'
    ]
};

/**
 * Manages local storage operations
 */
class StorageManager {
    static getUserUUID() {
        let uuid = localStorage.getItem('userUUID');
        if (!uuid) {
            uuid = crypto.randomUUID();
            localStorage.setItem('userUUID', uuid);
        }
        return uuid;
    }

    static getDisplayName() {
        return localStorage.getItem('pokerPointDisplayName') || '';
    }

    static setDisplayName(name) {
        localStorage.setItem('pokerPointDisplayName', name);
    }

    static getJiraLinked() {
        return localStorage.getItem('jiraLinked');
    }

    static setJiraLinked(value) {
        if (value) {
            localStorage.setItem('jiraLinked', value);
        } else {
            localStorage.removeItem('jiraLinked');
        }
    }
}

/**
 * Handles API requests
 */
class APIService {
    /**
     * Creates a new room
     * @param {string} roomName
     * @param {string[]} cards
     * @param {string} userUUID
     * @returns {Promise<Object>}
     */
    static async createRoom(roomName, cards, userUUID) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/create-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName, cards, userUUID })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create room');
        }

        return response.json();
    }

    /**
     * Checks if a room exists
     * @param {string} roomId
     * @returns {Promise<boolean>}
     */
    static async roomExists(roomId) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/check?roomId=${roomId}`);
        if (response.ok) {
            const body = await response.json();
            return body.valid;
        }
        return false;
    }
}

/**
 * Manages WebSocket communication
 */
class WebSocketService {
    constructor() {
        this.socket = null;
        this.currentRoomId = null;
        this.eventHandlers = new Map();
    }

    /**
     * Connects to WebSocket and sets up event handlers
     * @param {string} roomId
     * @param {string} displayName
     * @param {Function} onMessage
     */
    connect(roomId, displayName, onMessage) {
        this.currentRoomId = roomId;
        this.socket = new WebSocket(CONFIG.WEB_SOCKET_URL);

        this.socket.onopen = () => {
            this.sendMessage({
                action: 'join',
                roomId,
                displayName,
                userId: StorageManager.getUserUUID()
            });
            this.startHeartbeat();
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            onMessage(message.event, message.data);
        };

        this.socket.onclose = () => this.eventHandlers.get('close')?.();
        this.socket.onerror = (error) => this.eventHandlers.get('error')?.(error);
    }

    /**
     * Sends a WebSocket message
     * @param {Object} message
     */
    sendMessage(message) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    /**
     * Registers event handler
     * @param {string} event
     * @param {Function} handler
     */
    on(event, handler) {
        this.eventHandlers.set(event, handler);
    }

    /**
     * Closes WebSocket connection
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.currentRoomId = null;
        }
    }

    /**
     * Sends a heart beat to the server every 1 minute(s) to keep connection alive
     */
    startHeartbeat() {
        setInterval(() => {
            this.sendMessage({ action: 'heartbeat' });
            console.log("heart beat sent")
        }, 60000);
    }
}

/**
 * Manages UI rendering and interactions
 */
class UIManager {
    constructor() {
        this.currentCards = [];
        this.userMap = {};
        this.voteStatusMap = {};
        this.selectedVote = null;
        this.pieChartInstance = null;

        this.elements = {
            createRoomButton: document.getElementById('create-room-button'),
            joinRoomButton: document.getElementById('join-room-button'),
            roomSection: document.getElementById('room-section'),
            createRoomSection: document.getElementById('create-room-section'),
            joinRoomSection: document.getElementById('join-room-section'),
            roomNameDisplay: document.getElementById('room-name'),
            currentCardDisplay: document.getElementById('current-card'),
            participantsList: document.getElementById('participants-list'),
            cardsContainer: document.getElementById('cards-container'),
            showVotesButton: document.getElementById('show-votes-button'),
            addManualTickets: document.getElementById('add-manual-tickets'),
            loadingSpinner: document.getElementById('loading-spinner')
        };
    }

    /**
     * Initializes UI event listeners
     * @param {WebSocketService} wsService
     */
    init(wsService) {
        this.setupCreateRoomHandler();
        this.setupJoinRoomHandler(wsService);
        this.setupShowVotesHandler(wsService);
        this.setupManualTicketsHandler(wsService);
        this.setupTabNavigation();
        this.setupRoomObserver();
        this.setupInitialState();
    }

    /**
     * Sets up create room button handler
     */
    setupCreateRoomHandler() {
        this.elements.createRoomButton.addEventListener('click', async () => {
            const roomName = document.getElementById('create-room-name').value.trim();
            const cardsRaw = document.getElementById('create-cards').value.trim();
            const cards = cardsRaw.split(',').map(c => c.trim()).filter(c => c.length > 0);
            const userUUID = StorageManager.getUserUUID();

            if (!roomName || cards.length === 0) {
                alert('Please enter a room name and at least one card.');
                return;
            }

            try {
                const data = await APIService.createRoom(roomName, cards, userUUID);
                this.renderRoomCreationSuccess(data.roomId);
                if (StorageManager.getDisplayName()) {
                    await this.autoJoinRoom(true, wsService);
                }
            } catch (error) {
                alert(`Request failed: ${error.message}`);
            }
        });
    }

    /**
     * Sets up join room button handler
     * @param {WebSocketService} wsService
     */
    setupJoinRoomHandler(wsService) {
        this.elements.joinRoomButton.addEventListener('click', () => this.autoJoinRoom(false, wsService));
    }

    /**
     * Automatically joins a room
     * @param {boolean} ignoreValidation
     * @param {WebSocketService} wsService
     */
    async autoJoinRoom(ignoreValidation, wsService) {
        const roomId = document.getElementById('join-room-id').value.trim();
        const displayName = document.getElementById('join-display-name').value.trim();

        if (!ignoreValidation && (!roomId || !displayName)) {
            alert('Please enter both room ID and display name.');
            return;
        }

        if (!(await APIService.roomExists(roomId))) {
            alert('That room does not exist');
            return;
        }

        this.showSpinner();
        StorageManager.setDisplayName(displayName);
        this.onRoomJoined(roomId);

        wsService.connect(roomId, displayName, this.handleWebSocketMessage.bind(this));

        this.elements.createRoomSection.classList.add('hidden');
        this.elements.joinRoomSection.classList.add('hidden');
        this.elements.roomSection.classList.remove('hidden');
    }

    /**
     * Handles WebSocket messages
     * @param {string} event
     * @param {Object} data
     */
    handleWebSocketMessage(event, data) {
        switch (event) {
            case 'state':
                this.handleStateUpdate(data);
                break;
            case 'user-join':
                this.handleUserJoin(data);
                break;
            case 'user-disconnect':
                this.handleUserDisconnect(data);
                break;
            case 'vote':
                this.markUserVoted(data.userId);
                break;
            case 'jira':
                this.renderJiraTickets(data.items);
                break;
            case 'show':
                this.handleShowVotes(data);
                break;
            case 'card':
                this.handleCardUpdate(data);
                break;
        }
    }

    /**
     * Renders room creation success message and URL
     * @param {string} roomId
     */
    renderRoomCreationSuccess(roomId) {
        const responseEl = document.getElementById('create-room-response');
        const urlContainer = document.getElementById('room-url-container');
        const roomUrlInput = document.getElementById('room-url');
        const copyButton = document.getElementById('copy-room-url');

        responseEl.innerHTML = `<span class="text-green-400 font-semibold">Room created!</span> Share the link below:`;
        roomUrlInput.value = `${window.location.origin}/app/index.html?roomId=${roomId}`;
        urlContainer.classList.remove('hidden');
        document.getElementById('join-room-id').value = roomId;

        copyButton.textContent = 'Copy';
        copyButton.onclick = () => {
            roomUrlInput.select();
            document.execCommand('copy');
            copyButton.textContent = 'Copied!';
            setTimeout(() => copyButton.textContent = 'Copy', CONFIG.COPY_BUTTON_RESET_DELAY);
        };
    }

    /**
     * Handles room state update
     * @param {Object} data
     */
    handleStateUpdate(data) {
        this.elements.roomNameDisplay.textContent = data.roomName;
        this.elements.currentCardDisplay.textContent = data.card || 'N/A';
        this.elements.participantsList.innerHTML = '';
        this.userMap = {};
        this.voteStatusMap = {};
        this.selectedVote = null;

        const ownerUUID = data.ownerUUID;
        const userUUID = StorageManager.getUserUUID();
        const isOwner = ownerUUID === userUUID;

        this.toggleOwnerControls(isOwner);
        this.renderParticipants(data.participants);
        data.votes.forEach(vote => this.markUserVoted(vote));

        this.currentCards = data.cards;
        this.renderCardButtons();

        this.hideSpinner();
        this.updateVotingPanel(data.card);
    }

    /**
     * Toggles owner-specific controls
     * @param {boolean} isOwner
     */
    toggleOwnerControls(isOwner) {
        const elements = [
            document.getElementById('show-votes-button'),
            document.getElementById('manual-ticket-entry')
        ];
        elements.forEach(el => el.classList.toggle('hidden', !isOwner));
        if (isOwner) {
            this.showJira(this.currentRoomId);
        }
    }

    /**
     * Renders participant list
     * @param {Object[]} participants
     */
    renderParticipants(participants) {
        participants.forEach(p => {
            this.userMap[p.userId] = p.displayName;
            const li = document.createElement('li');
            li.className = 'flex items-center gap-3';
            li.dataset.userId = p.userId;

            const avatar = document.createElement('div');
            avatar.className = 'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold';
            avatar.style.backgroundColor = 'var(--primary)';
            avatar.textContent = p.displayName.charAt(0).toUpperCase();

            const name = document.createElement('span');
            name.textContent = p.displayName;

            li.appendChild(avatar);
            li.appendChild(name);
            this.elements.participantsList.appendChild(li);
        });
    }

    /**
     * Handles user join event
     * @param {Object} data
     */
    handleUserJoin(data) {
        if (this.userMap[data.userId]) return;

        this.userMap[data.userId] = data.displayName;
        const li = document.createElement('li');
        li.className = 'flex items-center gap-3';
        li.dataset.userId = data.userId;

        const avatar = document.createElement('div');
        avatar.className = 'bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold';
        avatar.textContent = data.displayName.charAt(0).toUpperCase();

        const name = document.createElement('span');
        name.textContent = data.displayName;

        li.appendChild(avatar);
        li.appendChild(name);
        this.elements.participantsList.appendChild(li);
    }

    /**
     * Handles user disconnect event
     * @param {Object} data
     */
    handleUserDisconnect(data) {
        const userId = data.userId;
        if (this.userMap[userId]) {
            delete this.userMap[userId];
            delete this.voteStatusMap[userId];
            const li = this.elements.participantsList.querySelector(`li[data-user-id="${userId}"]`);
            if (li) li.remove();
        }
    }

    /**
     * Marks a user as having voted
     * @param {string} userId
     */
    markUserVoted(userId) {
        const participantItem = this.elements.participantsList.querySelector(`li[data-user-id="${userId}"]`);
        if (!participantItem || participantItem.querySelector('.vote-tick')) return;

        const tick = document.createElement('span');
        tick.classList.add('vote-tick', 'text-green-400', 'ml-2');
        tick.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        `;
        participantItem.querySelector('span').appendChild(tick);
    }

    /**
     * Clears all vote marks
     */
    clearAllUserVoteMarks() {
        this.elements.participantsList.querySelectorAll('.vote-tick').forEach(tick => tick.remove());
    }

    /**
     * Renders card selection buttons
     */
    renderCardButtons() {
        this.elements.cardsContainer.innerHTML = '';
        this.currentCards.forEach(cardValue => {
            const button = document.createElement('button');
            button.className = `card-button text-indigo-300 font-semibold py-2 px-4 rounded-lg ${cardValue === this.selectedVote ? 'selected' : ''}`;
            button.textContent = cardValue;
            button.addEventListener('click', () => {
                this.selectedVote = cardValue;
                this.wsService.sendMessage({
                    action: 'vote',
                    roomId: this.currentRoomId,
                    vote: cardValue,
                    userId: StorageManager.getUserUUID()
                });
                this.renderCardButtons();
            });
            this.elements.cardsContainer.appendChild(button);
        });
    }

    /**
     * Updates voting panel state
     * @param {string|null} currentCard
     */
    updateVotingPanel(currentCard) {
        const castEstimatesPanel = document.getElementById('cast-estimates-panel');
        const votingClosedMessage = document.getElementById('voting-closed-message');
        const revealVotesButton = document.getElementById('show-votes-button');

        if (currentCard === 'N/A') {
            castEstimatesPanel.classList.add('disabled-overlay');
            votingClosedMessage.classList.remove('hidden');
            revealVotesButton.disabled = true;
            revealVotesButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            castEstimatesPanel.classList.remove('disabled-overlay');
            votingClosedMessage.classList.add('hidden');
            revealVotesButton.disabled = false;
            revealVotesButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Handles show votes event
     * @param {Object[]} votes
     */
    handleShowVotes(votes) {
        this.updateVotingPanel('N/A');
        this.clearAllUserVoteMarks();

        const voteCounts = {};
        const voteGroups = {};
        votes.forEach(entry => {
            const vote = entry.vote;
            const userId = entry.userId;
            const displayName = this.userMap[userId];
            if (displayName) {
                voteCounts[vote] = (voteCounts[vote] || 0) + 1;
                voteGroups[vote] = voteGroups[vote] || [];
                voteGroups[vote].push(userId);
            }
        });

        this.renderVoteChart(voteCounts);
        this.renderVoteBreakdown(voteGroups);

        const modal = document.getElementById('vote-chart-modal');
        modal.classList.remove('hidden');
        document.getElementById('close-chart-modal').onclick = () => {
            modal.classList.add('hidden');
            if (this.pieChartInstance) {
                this.pieChartInstance.destroy();
                this.pieChartInstance = null;
            }
        };

        this.selectedVote = null;
        this.renderCardButtons();
        this.hideSpinner();
    }

    /**
     * Renders vote distribution chart
     * @param {Object} voteCounts
     */
    renderVoteChart(voteCounts) {
        if (this.pieChartInstance) {
            this.pieChartInstance.destroy();
        }

        const ctx = document.getElementById('vote-pie-chart').getContext('2d');
        this.pieChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(voteCounts),
                datasets: [{
                    data: Object.values(voteCounts),
                    backgroundColor: CONFIG.CHART_COLORS,
                    borderColor: '#1F2937',
                    borderWidth: 2
                }]
            },
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
                            label: (context) => {
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
    }

    /**
     * Renders vote breakdown details
     * @param {Object} voteGroups
     */
    renderVoteBreakdown(voteGroups) {
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
                                ${this.userMap[userId]}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
            breakdownContainer.appendChild(groupDiv);
        });
    }

    /**
     * Handles card update event
     * @param {Object} data
     */
    handleCardUpdate(data) {
        this.updateVotingPanel(data.name);
        this.clearAllUserVoteMarks();
        this.elements.currentCardDisplay.textContent = data.name;
        this.voteStatusMap = {};
        this.selectedVote = null;
        this.renderCardButtons();
        this.hideSpinner();
    }

    /**
     * Sets up tab navigation
     */
    setupTabNavigation() {
        const createRoomButton = document.getElementById('show-create-room');
        const joinRoomButton = document.getElementById('show-join-room');

        createRoomButton.addEventListener('click', () => {
            this.elements.createRoomSection.classList.remove('hidden');
            this.elements.joinRoomSection.classList.add('hidden');
            createRoomButton.classList.add('active');
            joinRoomButton.classList.remove('active');
        });

        joinRoomButton.addEventListener('click', () => {
            this.elements.joinRoomSection.classList.remove('hidden');
            this.elements.createRoomSection.classList.add('hidden');
            joinRoomButton.classList.add('active');
            createRoomButton.classList.remove('active');
        });
    }

    /**
     * Sets up room section observer
     */
    setupRoomObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const setupSection = document.getElementById('setup-section');
                    if (!this.elements.roomSection.classList.contains('hidden')) {
                        setupSection.classList.add('hidden');
                    } else {
                        setupSection.classList.remove('hidden');
                        setTimeout(() => {
                            this.elements.roomSection.classList.remove('translate-y-10', 'opacity-0');
                            this.elements.roomSection.classList.add('translate-y-0', 'opacity-100');
                        }, 50);
                    }
                }
            });
        });
        observer.observe(this.elements.roomSection, { attributes: true });
    }

    /**
     * Sets up initial UI state
     */
    setupInitialState() {
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('roomId');
        const jira = params.get('jira');

        if (roomId) {
            this.elements.createRoomSection.classList.add('hidden');
            this.elements.joinRoomSection.classList.remove('hidden');
            document.getElementById('show-create-room').classList.remove('active');
            document.getElementById('show-join-room').classList.add('active');
            document.getElementById('join-room-id').value = roomId;
        }

        if (jira) {
            StorageManager.setJiraLinked(jira);
        } else {
            StorageManager.setJiraLinked(null);
        }

        const savedName = StorageManager.getDisplayName();
        if (savedName) {
            document.getElementById('join-display-name').value = savedName;
        }

        if (roomId && savedName) {
            this.autoJoinRoom(true, this.wsService);
        }
    }

    /**
     * Shows loading spinner
     */
    showSpinner() {
        this.elements.loadingSpinner.classList.remove('hidden');
    }

    /**
     * Hides loading spinner
     */
    hideSpinner() {
        this.elements.loadingSpinner.classList.add('hidden');
    }

    /**
     * Renders Jira integration section
     * @param {string} roomId
     */
    showJira(roomId) {
        const jiraLinked = StorageManager.getJiraLinked();
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

                try {
                    this.showSpinner();
                    this.wsService.sendMessage({
                        action: 'jira',
                        roomId,
                        userId: StorageManager.getUserUUID(),
                        jql
                    });
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
                const state = encodeURIComponent(`${StorageManager.getUserUUID()}:${roomId}`);
                window.location.href = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${CONFIG.JIRA_CLIENT_ID}&scope=${CONFIG.JIRA_SCOPE}&redirect_uri=${encodeURIComponent(CONFIG.JIRA_REDIRECT_URI)}&state=${state}&response_type=code&prompt=consent`;
            });
        }
    }

    /**
     * Renders Jira tickets
     * @param {Object[]} items
     */
    renderJiraTickets(items) {
        const container = document.getElementById('jira-query-section');
        let jiraTicketsContainer = document.getElementById('jira-tickets-container');

        if (jiraTicketsContainer) {
            jiraTicketsContainer.remove();
        }

        jiraTicketsContainer = document.createElement('div');
        jiraTicketsContainer.id = 'jira-tickets-container';
        jiraTicketsContainer.className = 'mt-4 space-y-2';

        items.forEach(issue => {
            const div = document.createElement('div');
            div.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';
            div.dataset.issueKey = issue.key;
            div.innerHTML = `
                <span>${issue.key}: ${issue.summary}</span>
                <button class="bg-indigo-500 text-white px-3 py-1 rounded" onclick="uiManager.setJiraCard('${issue.key}: ${issue.summary.replace(/'/g, "\\'")}', '${issue.key}')">
                    Start Voting
                </button>
            `;
            jiraTicketsContainer.appendChild(div);
        });

        container.appendChild(jiraTicketsContainer);
        this.hideSpinner();
    }

    /**
     * Sets a Jira card for voting
     * @param {string} summary
     * @param {string} issueKey
     */
    setJiraCard(summary, issueKey) {
        if (!this.wsService.socket || !this.currentRoomId) {
            alert('You need to join a room first.');
            return;
        }

        this.wsService.sendMessage({
            action: 'card',
            roomId: this.currentRoomId,
            name: summary
        });

        const ticketDiv = document.querySelector(`[data-issue-key="${issueKey}"]`);
        if (ticketDiv) ticketDiv.remove();
    }

    /**
     * Sets up manual tickets handler
     * @param {WebSocketService} wsService
     */
    setupManualTicketsHandler(wsService) {
        this.elements.addManualTickets.addEventListener('click', () => {
            const input = document.getElementById('manual-tickets-input').value.trim();
            const container = document.getElementById('manual-tickets-list');
            if (!input) return;

            const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
            lines.forEach((line, index) => {
                const id = `manual-${Date.now()}-${index}`;
                const div = document.createElement('div');
                div.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';
                div.dataset.manualKey = id;
                div.innerHTML = `
                    <span>${line}</span>
                    <button class="bg-indigo-500 text-white px-3 py-1 rounded" onclick="uiManager.setManualCard('${line.replace(/'/g, "\\'")}', '${id}')">
                        Start Voting
                    </button>
                `;
                container.appendChild(div);
            });
            document.getElementById('manual-tickets-input').value = '';
        });
    }

    /**
     * Sets a manual card for voting
     * @param {string} summary
     * @param {string} key
     */
    setManualCard(summary, key) {
        if (!this.wsService.socket || !this.currentRoomId) {
            alert('You need to join a room first.');
            return;
        }

        this.wsService.sendMessage({
            action: 'card',
            roomId: this.currentRoomId,
            name: summary
        });

        const ticketDiv = document.querySelector(`[data-manual-key="${key}"]`);
        if (ticketDiv) ticketDiv.remove();
    }

    /**
     * Sets up room URL vote section
     * @param {string} roomId
     */
    setupRoomUrlVoteSection(roomId) {
        if (!roomId) return;

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
            setTimeout(() => copyButton.textContent = 'Copy', CONFIG.COPY_BUTTON_RESET_DELAY);
        };
    }

    /**
     * Handles room joined event
     * @param {string} roomId
     */
    onRoomJoined(roomId) {
        this.setupRoomUrlVoteSection(roomId);
        this.currentRoomId = roomId;
    }

    /**
     * Sets estimation values
     * @param {string} values
     */
    setEstimationValues(values) {
        document.getElementById('create-cards').value = values;
    }

    /**
     * Leaves the current room
     */
    leaveRoom() {
        this.wsService.disconnect();
        StorageManager.setJiraLinked(null);
        this.currentRoomId = null;
        this.currentCards = [];
        this.userMap = {};
        this.voteStatusMap = {};
        this.selectedVote = null;
        this.elements.participantsList.innerHTML = '';
        this.elements.cardsContainer.innerHTML = '';
        this.elements.roomNameDisplay.textContent = '';
        this.elements.currentCardDisplay.textContent = 'N/A';
        this.elements.createRoomSection.classList.remove('hidden');
        this.elements.joinRoomSection.classList.remove('hidden');
        this.elements.roomSection.classList.add('hidden');
        document.getElementById('show-create-room').classList.add('active');
        document.getElementById('show-join-room').classList.remove('active');
        document.getElementById('create-room-name').value = '';
        document.getElementById('create-cards').value = '';
        document.getElementById('create-room-response').textContent = '';
        window.location.replace(`${window.location.origin}/app/index.html`);
    }

    /**
     * Sets up show votes button handler
     * @param {WebSocketService} wsService
     */
    setupShowVotesHandler(wsService) {
        this.elements.showVotesButton.addEventListener('click', () => {
            this.showSpinner();
            wsService.sendMessage({
                action: 'show',
                roomId: this.currentRoomId
            });
        });
    }
}

// Initialize application
const wsService = new WebSocketService();
const uiManager = new UIManager();
uiManager.wsService = wsService;

wsService.on('close', () => uiManager.leaveRoom());
wsService.on('error', (error) => console.error('WebSocket error:', error));

document.addEventListener('DOMContentLoaded', () => {
    uiManager.init(wsService);
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        document.getElementById('close-chart-modal').click();
    }
});


// Expose global functions for inline event handlers
window.uiManager = uiManager;