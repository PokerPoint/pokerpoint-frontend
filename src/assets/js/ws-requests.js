function joinRoom(socket, roomId, displayName) {
    sendMessage(socket, {
        action: "join",
        roomId: roomId,
        displayName: displayName,
        userId: getOrCreateUUID(),
    });
}

function setCard(socket, roomId, name) {
    showSpinner()
    sendMessage(socket, {
        action: "card",
        roomId: roomId,
        name: name
    });
}

function jira(socket, roomId, jql) {
    sendMessage(socket, {
        action: "jira",
        roomId: roomId,
        userId: getOrCreateUUID(),
        jql: jql
    });
}

function vote(socket, roomId, vote) {
    sendMessage(socket, {
        action: "vote",
        roomId: roomId,
        vote: vote,
        userId: getOrCreateUUID(),
    });
}

function show(socket, roomId) {
    sendMessage(socket, {
        action: "show",
        roomId: roomId,
        vote: vote
    });
}

function sendMessage(socket, message) {
    socket.send(JSON.stringify(message));
}