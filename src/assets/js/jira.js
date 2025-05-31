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
        Set Task
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

