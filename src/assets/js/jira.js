async function fetchJiraTickets(jql, roomId) {
    showSpinner()
    jira(socket, roomId, jql)
}

let jiraTicketsContainer = null;

function renderJiraTickets(result) {
    if (jiraTicketsContainer) {
        jiraTicketsContainer.remove();
    }

    hideSpinner();

    jiraTicketsContainer = document.createElement('div');
    jiraTicketsContainer.id = 'jira-tickets-container';
    jiraTicketsContainer.className = 'mt-4 space-y-2';

    result.forEach(issue => {
        const div = document.createElement('div');
        div.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';
        div.dataset.issueKey = issue.key;

        div.innerHTML = `
      <span>${issue.key}: ${issue.summary}</span>
      <button class="bg-indigo-500 text-white px-3 py-1 rounded" onclick="setJiraCard('${issue.key}: ${issue.summary.replace(/'/g, "\\'")}', '${issue.key}')">
        Start Voting
      </button>
    `;

        jiraTicketsContainer.appendChild(div);
    });

    document.getElementById('jira-query-section').appendChild(jiraTicketsContainer);
}


function setJiraCard(summary, issueKey) {
    if (!socket || !currentRoomId) {
        alert("You need to join a room first.");
        return;
    }

    setCard(socket, currentRoomId, summary);

    // Remove the ticket from the list
    const ticketDiv = jiraTicketsContainer?.querySelector(`[data-issue-key="${issueKey}"]`);
    if (ticketDiv) {
        ticketDiv.remove();
    }
}

document.getElementById('add-manual-tickets').addEventListener('click', () => {
    const input = document.getElementById('manual-tickets-input').value.trim();
    const container = document.getElementById('manual-tickets-list');

    if (!input) return;

    const lines = input.split('\n').map(line => line.trim()).filter(Boolean);

    lines.forEach((line, index) => {
        const div = document.createElement('div');
        const id = `manual-${Date.now()}-${index}`;
        div.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';
        div.dataset.manualKey = id;

        div.innerHTML = `
            <span>${line}</span>
            <button class="bg-indigo-500 text-white px-3 py-1 rounded" onclick="setManualCard('${line.replace(/'/g, "\\'")}', '${id}')">
                Start Voting
            </button>
        `;

        container.appendChild(div);
    });

    document.getElementById('manual-tickets-input').value = '';
});

function setManualCard(summary, key) {
    if (!socket || !currentRoomId) {
        alert("You need to join a room first.");
        return;
    }

    setCard(socket, currentRoomId, summary);

    const ticketDiv = document.querySelector(`[data-manual-key="${key}"]`);
    if (ticketDiv) {
        ticketDiv.remove();
    }
}
