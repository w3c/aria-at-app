const iframeClass = `support-levels-${document.currentScript.getAttribute(
    'pattern'
)}`;

const iframeCode = link =>
    `<iframe
  class="${iframeClass}"
  src="${link}"
  height="100"
  allow="clipboard-write"
  style="border-style: none; width: 100%;">
</iframe>`;

// eslint-disable-next-line no-unused-vars
const announceCopied = link => {
    navigator.clipboard.writeText(iframeCode(link));
    const parentDiv = document.getElementById('copied-message');
    const innerDiv = document.createElement('div');
    const innerText = document.createTextNode('Copied code for embedding.');
    innerDiv.appendChild(innerText);
    innerDiv.setAttribute('role', 'alert');
    if (!parentDiv.firstChild) {
        parentDiv.appendChild(innerDiv);
        // Wrapping text might cause the iframe height to change
        postHeightAndClass();
    }
    setTimeout(() => {
        document.getElementById('copied-message').removeChild(innerDiv);
        postHeightAndClass();
    }, 5000);
};

const postHeightAndClass = () =>
    window.parent.postMessage(
        { height: document.body.scrollHeight, iframe: iframeClass },
        '*'
    );

window.onresize = postHeightAndClass;
document
    .querySelector('details')
    .addEventListener('toggle', postHeightAndClass);

postHeightAndClass();
