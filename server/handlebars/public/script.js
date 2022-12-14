// eslint-disable-next-line no-unused-vars
const announceCopied = link => {
    navigator.clipboard.writeText(link);
    const parentDiv = document.getElementById('copied-message');
    const innerDiv = document.createElement('div');
    const innerText = document.createTextNode('Embed link copied.');
    innerDiv.appendChild(innerText);
    innerDiv.setAttribute('role', 'alert');
    parentDiv.appendChild(innerDiv);
    setTimeout(() => {
        document.getElementById('copied-message').removeChild(innerDiv);
    }, 1000);
};

window.parent.postMessage(`{ height: ${document.body.scrollHeight} }`, '*');
