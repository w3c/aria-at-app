const selector = 'input, button, textarea, select, fieldset, optgroup, option';

// serialize form elements by saving
// 'checked', 'indeterminate', 'value',
// 'name', 'disabled', and 'selected'
// state
export function serialize(root) {
    const nodes = root.querySelectorAll(selector);

    // serialized element state is saved in an
    // array since element traversal order will
    // always be the same
    let serialized = [];

    for (let node of nodes) {
        let nodeState = {};

        switch (node.tagName.toLowerCase()) {
            case 'input':
                if (node.type == 'checkbox' || node.type == 'radio') {
                    nodeState.checked = node.checked;
                    nodeState.indeterminate = node.indeterminate;
                }
            // falls through
            case 'button':
            case 'textarea':
                nodeState.value = node.value;
            // falls through
            case 'select':
            case 'fieldset':
                nodeState.name = node.name;
            // falls through
            case 'optgroup':
                nodeState.disabled = node.disabled;
                break;
            case 'option':
                nodeState.value = node.value;
                nodeState.disabled = node.disabled;
                nodeState.selected = node.selected;
                break;
            default:
                break;
        }

        serialized.push(nodeState);
    }

    return serialized;
}

// hydrate form elements by restoring
// 'checked', 'indeterminate', 'value',
// 'name', 'disabled', and 'selected'
// state
export function hydrate(serialized, root) {
    const nodes = root.querySelectorAll(selector);

    if (nodes.length !== serialized.length)
        throw new Error(
            'Form deserialization failed: serialized nodes are not the same shape as given nodes'
        );

    for (let [i, node] of nodes.entries()) {
        const nodeState = serialized[i];
        if (typeof nodeState.disabled !== 'undefined') {
            node.disabled = nodeState.disabled;
        }
        if (typeof nodeState.name !== 'undefined') {
            node.name = nodeState.name;
        }
        if (typeof nodeState.value !== 'undefined') {
            node.value = nodeState.value;
        }
        if (typeof nodeState.selected !== 'undefined') {
            node.selected = nodeState.selected;
        }
        if (typeof nodeState.indeterminate !== 'undefined') {
            node.indeterminate = nodeState.indeterminate;
        }
        if (typeof nodeState.checked !== 'undefined') {
            node.checked = nodeState.checked;
        }
    }
}
