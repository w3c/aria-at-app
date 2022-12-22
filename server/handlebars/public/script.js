const iframeClass = `support-levels-${document.currentScript.getAttribute(
    'pattern'
)}`;

const iframeCode = link =>
    `  <iframe
    class="${iframeClass}"
    src="${link}"
    height="500"
    allow="clipboard-write"
    style="border-style: none; width: 100%;">
    </iframe>`;

// eslint-disable-next-line no-unused-vars
const announceCopied = link => {
    navigator.clipboard.writeText(iframeCode(link));
    const parentDiv = document.getElementById('copied-message');
    const innerDiv = document.createElement('div');
    const innerText = document.createTextNode('Embed link copied.');
    innerDiv.appendChild(innerText);
    innerDiv.setAttribute('role', 'alert');
    if (!parentDiv.firstChild) {
        parentDiv.appendChild(innerDiv);
    }
    setTimeout(() => {
        document.getElementById('copied-message').removeChild(innerDiv);
    }, 5000);
};

const postHeightAndClass = () =>
    window.parent.postMessage(
        { height: document.body.scrollHeight, iframe: iframeClass },
        '*'
    );

window.onresize = postHeightAndClass;
postHeightAndClass();
